import React, { useContext, useState } from "react";
import { Col, Table } from "reactstrap";
import { checkForDecimalAndNull } from "../../../../../helper";
import { useSelector } from "react-redux";
import { ViewCostingContext } from "../../CostingDetails";
import NoContentFound from "../../../../common/NoContentFound";
import { EMPTY_DATA } from "../../../../../config/constants";
import { reactLocalStorage } from "reactjs-localstorage";

const OtherCostTable = (props) => {
    const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
    const CostingViewMode = useContext(ViewCostingContext);
    const { gridData, otherCostTotal } = props.tableData
    const { currencySource } = useSelector((state) => state?.costing);
    return <>
        <Col md="12" className="mb-2">
            <Table className="table mb-0 forging-cal-table" size="sm">
                <thead>
                    <tr>
                        {initialConfiguration.IsShowCRMHead && <th>{`CRM Head`}</th>}
                        <th>{`Other Cost Description`}</th>
                        {/* <th>{`Other Cost Type`}</th> */}
                        <th>{`Other Cost Applicability`}</th>
                        <th>{`Cost Applicability (${currencySource?.label ?? initialConfiguration?.BaseCurrency})`}</th>
                        <th>{'Percentage (%)'}</th>
                        <th>{`Cost`}</th>
                        {!CostingViewMode && <th className='text-right'>{`Action`}</th>}
                    </tr>
                </thead>
                <tbody>
                    {gridData && gridData.map((item, index) => {
                        return (
                            <tr key={index} >
                                {initialConfiguration.IsShowCRMHead && <td>{item.CRMHead}</td>}
                                <td>{item.OtherCostDescription}</td>
                                {/* <td>{item.OtherCostType}</td> */}
                                <td>{item?.OtherCostApplicability}</td>
                                <td>{checkForDecimalAndNull(item?.ApplicabilityCost, initialConfiguration.NoOfDecimalForPrice)}</td>
                                <td>{item?.PercentageOtherCost}</td>
                                <td>{checkForDecimalAndNull(item.AnyOtherCost, initialConfiguration.NoOfDecimalForPrice)}</td>
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

                    {gridData.length === 0 ? (
                        <tr>
                            <td colSpan={"6"}> <NoContentFound title={EMPTY_DATA} /></td>
                        </tr>
                    ) : (
                        <tr className='table-footer'>
                            <td colSpan={initialConfiguration.IsShowCRMHead ? 5 : 4} className='text-right'>
                                Total Other Cost ({currencySource?.label ?? initialConfiguration?.BaseCurrency}):
                            </td>
                            <td colSpan={3}>
                                {checkForDecimalAndNull(otherCostTotal, initialConfiguration.NoOfDecimalForPrice)}
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </Col>
    </>
}
export default OtherCostTable;