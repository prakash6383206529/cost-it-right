import React, { useContext, useState } from 'react'
import { useSelector } from 'react-redux';
import { reactLocalStorage } from 'reactjs-localstorage';
import { Col, Table } from 'reactstrap';
import { ViewCostingContext } from '../../CostingDetails';
import { checkForDecimalAndNull } from '../../../../../helper';
import NoContentFound from '../../../../common/NoContentFound';
import { EMPTY_DATA } from '../../../../../config/constants';

export default function OtherDiscountTable(props) {
    const { tableData } = props
    const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
    const CostingViewMode = useContext(ViewCostingContext);
    const { currencySource } = useSelector((state) => state?.costing);
    // const [state, setState] = useState({
    //     gridData: props.gridData.length !== 0 ? props.gridData : [],
    // })
    return (
        <Col md="12" className="mb-2">
            <Table className="table mb-0 forging-cal-table" size="sm">
                <thead>
                    <tr>
                        {initialConfiguration.IsShowCRMHead && <th>{`CRM Head`}</th>}
                        <th>{`Description`}</th>
                        {/* <th>{`Other Cost Type`}</th> */}
                        <th>{`Applicability`}</th>
                        <th>{`Applicability (${currencySource?.label ?? "Currency"})`}</th>
                        <th>{'Percentage (%)'}</th>
                        <th>{`Cost`}</th>
                        {!CostingViewMode && <th className='text-right'>{`Action`}</th>}
                    </tr>
                </thead>
                <tbody>
                    {tableData.gridData && tableData.gridData.length !== 0 && tableData.gridData.map((item, index) => {
                        return (
                            <tr key={index} >
                                {initialConfiguration.IsShowCRMHead && <td>{item.CRMHead}</td>}
                                <td>{item.Description}</td>
                                <td>{item.ApplicabilityType}</td>
                                <td>{checkForDecimalAndNull(item?.ApplicabilityCost, initialConfiguration.NoOfDecimalForPrice)}</td>
                                <td>{item?.PercentageDiscountCost !== '' ? item?.PercentageDiscountCost : '-'}</td>
                                <td>{checkForDecimalAndNull(item.NetCost, initialConfiguration.NoOfDecimalForPrice)}</td>
                                {!CostingViewMode && <td className='text-right'>
                                    <button
                                        className="Edit"
                                        title='Edit'
                                        type={"button"}
                                        onClick={() =>
                                            props.editItemDetails(index)
                                        }
                                    />
                                    <button
                                        className="Delete ml-1"
                                        title='Delete'
                                        type={"button"}
                                        onClick={() =>
                                            props.deleteItem(index)
                                        }
                                    />
                                </td>}
                            </tr>
                        );
                    })}

                    {tableData.gridData && tableData.gridData.length === 0 ? (
                        <tr>
                            <td colSpan={initialConfiguration.IsShowCRMHead ? 7 : 6}> <NoContentFound title={EMPTY_DATA} /></td>
                        </tr>
                    ) : (
                        <tr className='table-footer'>
                            <td colSpan={initialConfiguration.IsShowCRMHead ? 5 : 4} className='text-right'>
                                Total Discount Cost (${currencySource?.label ?? "Currency"})):
                            </td>
                            <td colSpan={3}>
                                {checkForDecimalAndNull(tableData.otherCostTotal, initialConfiguration.NoOfDecimalForPrice)}
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </Col>
    )
}
