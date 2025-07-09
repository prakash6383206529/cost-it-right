import React, { useState, useEffect, Fragment, useContext } from 'react'
import { Table } from 'reactstrap'
import { costingInfoContext } from '../CostingDetailStepTwo'
import { useLabels } from '../../../../helper/core'
import { CBCTypeId, VBCTypeId, WACTypeId } from '../../../../config/constants'
import { useSelector } from 'react-redux'
import DayTime from '../../../common/DayTimeWrapper'
import { checkForDecimalAndNull, getConfigurationKey } from '../../../../helper'
import TooltipCustom from '../../../common/Tooltip'


const ViewMultipleTechnologyBOP = (props) => {
    const costData = useContext(costingInfoContext);
    const { vendorLabel } = useLabels();
    const { currencySource } = useSelector(state => state.costing)
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    const { data } = props

    const tooltipText = (item) => {
        return (
            <div>
                <div>{`Settled Price (${initialConfiguration?.BaseCurrency}) : ${(item?.SettledPriceConversion ? checkForDecimalAndNull(item?.SettledPriceConversion, getConfigurationKey()?.NoOfDecimalForPrice) : '-')}`}</div>
            </div>
        )
    }

    return(
        <>
            <Table className="table cr-brdr-main" size="sm">
                <thead>
                    <tr >
                        {(costData?.CostingTypeId === VBCTypeId || props?.costingTypeId === VBCTypeId) &&
                            <th>{vendorLabel} (Code)</th>
                        }
                        {(costData?.CostingTypeId === VBCTypeId || props?.costingTypeId === VBCTypeId) &&
                            <th>Source {vendorLabel} (Code)</th>
                        }
                        {(costData?.CostingTypeId === CBCTypeId || props?.costingTypeId === CBCTypeId) &&
                            <th>Customer (Code)</th>
                        }
                        <th>Costing Number</th>
                        {<th>BOP Type</th>}
                        <th>Settled Price ({costData?.LocalCurrency ? costData?.LocalCurrency : (props?.viewCostingData?.[props?.index]?.LocalCurrency ? props?.viewCostingData?.[props?.index]?.LocalCurrency : '-')})</th>
                        {(costData?.CostingTypeId !== WACTypeId && props?.costingTypeId !== WACTypeId) && <th>Delta</th>}
                        <th>SOB%</th>
                        <th>Net Cost ({currencySource?.label ? currencySource?.label : '-'})</th>
                        <th>Remark</th>
                        {<th>Effective Date</th>}
                    </tr >
                </thead >

                {data && Array.isArray(data) && data.length > 0 && data.map((item, index) => {
                    return(
                        <tr key={index}>
                            {(costData?.CostingTypeId === VBCTypeId || props?.costingTypeId === VBCTypeId) &&
                                <td>{`${item?.Vendor || '-'}`}</td>
                            }
                            {(costData?.CostingTypeId === VBCTypeId || props?.costingTypeId === VBCTypeId) &&
                                <td>{`${item?.SourceVendor || '-'}`}</td>
                            }
                            {(costData?.CostingTypeId === CBCTypeId || props?.costingTypeId === CBCTypeId) &&
                                <td>{`${item.Customer || '-'}`}</td>
                            }
                            <td>{item.BoughtOutPartNumber || '-'}</td>
                            <td>{item?.BOPType ?? "-"}</td>
                            <td>{item?.SettledPrice ? checkForDecimalAndNull(item?.SettledPrice, getConfigurationKey()?.NoOfDecimalForPrice) : '-'}{item?.SettledPrice && <span><TooltipCustom customClass="float-unset" tooltipClass="process-quatity-tooltip" id={`settled-price-${item?.BoughtOutPartId}${index}`} tooltipText={() => tooltipText(item)} /></span>}</td>
                            <td>{item?.Delta ?? "-"}</td>
                            {
                                (costData?.CostingTypeId !== WACTypeId && props?.costingTypeId !== WACTypeId) &&
                                <td >{item?.SOBPercentage ?? "-"}</td>
                            }
                            <td>{item?.NetCost ? checkForDecimalAndNull(item?.NetCost, getConfigurationKey()?.NoOfDecimalForPrice) : '-'}</td>
                            <td>{item?.Remark ? item?.Remark : '-'}</td>
                            <td>{item?.EffectiveDate ? DayTime(item?.EffectiveDate).format('DD-MM-YYYY') : '-'}</td>
                        </tr>
                    )
                })}
            </Table>
        </>
    )
}


export default ViewMultipleTechnologyBOP;