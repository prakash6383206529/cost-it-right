// AdditionalInfoComponent.js
import React from 'react';
import { VARIANCE } from '../../../../../config/constants';
import { viewCostingData } from './TcoDummyData';
const AdditionalTcoInfo = ({ isApproval, /* viewCostingData */isRfqCosting }) => {
    const tableDataClass = (data) => {
        return isRfqCosting && data.isRFQFinalApprovedCosting && !isApproval && !data?.bestCost ? 'finalize-cost' : ''
    }
    return (
        <>
            <tr>
                <td >
                    <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1} `}>Inco Terms </span>
                    {/* <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1} `}>Payment Terms </span> */}
                    <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1} `}>Warranty Year</span>
                    <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1}`}>Quality PPM</span>
                    <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1}`}>MOQ</span>
                    <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1}`}>SPQ</span>
                    <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1}`}>Lead Time</span>
                    <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1}`}>Ld Clause</span>
                    <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1}`}>Available Capacity</span>
                </td>
                {viewCostingData &&
                    viewCostingData?.map((data) => {
                        return (
                            <td className={tableDataClass(data)}>
                                <span className="d-block">{(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.tcoValues?.IncoTerms : '')}</span>
                                <span className="d-block">{(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.tcoValues?.WarrantyYears : '')}</span>
                                <span className="d-block">{(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.tcoValues?.QualityPPM : '')}</span>
                                <span className="d-block">{(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.tcoValues?.MOQ : '')}</span>
                                <span className="d-block">{(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.tcoValues?.SPQ : '')}</span>
                                <span className="d-block">{(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.tcoValues?.LeadTime : '')}</span>
                                <span className="d-block">{(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.tcoValues?.LdClause : '')}</span>
                                <span className="d-block">{(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.tcoValues?.AvailableCapacity : '')}</span>

                            </td>
                        )
                    })}
            </tr>

        </>
    );
};

export default AdditionalTcoInfo;
