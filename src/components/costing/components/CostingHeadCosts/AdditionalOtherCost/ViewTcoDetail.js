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
                    <span className="d-block small-grey-text pt-3"></span>
                    <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1} `}>Inco Terms </span>
                    <span className="d-block small-grey-text pt-3"></span>
                    <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1} `}>Payment Terms </span>
                    <span className="d-block small-grey-text pt-3"></span>
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

                                <div style={{ width: '95%' }} className={`d-flex justify-content-between`}>
                                    <div>
                                        <div className=''>Applicability</div>
                                        <div className={""}>{data?.CostingHeading !== VARIANCE && data?.tcoValues?.TotalCostDetails?.length > 0 && (data?.tcoValues?.TotalCostDetails[0]?.ApplicabilityType ?? '-')}</div>

                                    </div>
                                    <div>
                                        <div>Percentage (%)</div>
                                        <div className={""}>{data?.CostingHeading !== VARIANCE && data?.tcoValues?.TotalCostDetails?.length > 0 && (data?.tcoValues?.TotalCostDetails[0]?.ApplicabilityType ?? '-')}</div>

                                    </div>
                                    <div className='mr-2'>
                                        <div>Value</div>
                                        <div className={""}>{data?.CostingHeading !== VARIANCE && data?.tcoValues?.TotalCostDetails?.length > 0 && (data?.tcoValues?.TotalCostDetails[0]?.NetCost ?? '-')}</div>

                                    </div>
                                </div>
                                <div style={{ width: '49%' }} className={`d-flex justify-content-between`}>
                                    <div>
                                        <div className=''>Days</div>
                                        <div className={""}>{data?.CostingHeading !== VARIANCE && data?.tcoValues?.TotalCostDetails?.length > 0 && (data?.tcoValues?.TotalCostDetails[0]?.Days ?? '-')}</div>

                                    </div>
                                    <div className='mr-2'>
                                        <div>Value</div>
                                        <div className={""}>{data?.CostingHeading !== VARIANCE && data?.tcoValues?.TotalCostDetails?.length > 0 && (data?.tcoValues?.TotalCostDetails[0]?.NetCost ?? '-')}</div>

                                    </div>
                                </div>
                                <div style={{ width: '49%' }} className={`d-flex justify-content-between`}>
                                    <div>
                                        <div>Year</div>
                                        <div className={""}>{data?.CostingHeading !== VARIANCE && data?.tcoValues?.TotalCostDetails?.length > 0 && (data?.tcoValues?.TotalCostDetails[0]?.Years ?? '-')}</div>

                                    </div>
                                    <div className='mr-2'>
                                        <div>Value</div>
                                        <div className={""}>{data?.CostingHeading !== VARIANCE && data?.tcoValues?.TotalCostDetails?.length > 0 && (data?.tcoValues?.TotalCostDetails[0]?.NetCost ?? '-')}</div>

                                    </div>
                                </div>
                                {/* <span className="d-block">{(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.tcoValues?.WarrantyYears : '')}</span> */}
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
