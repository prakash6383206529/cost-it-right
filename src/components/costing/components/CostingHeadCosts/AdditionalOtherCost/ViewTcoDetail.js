// AdditionalInfoComponent.js
import React from 'react';
import { VARIANCE } from '../../../../../config/constants';
//import { viewCostingData } from './TcoDummyData';
const ViewTcoDetail = ({ isApproval, viewCostingData, isRfqCosting, highlighter, displayValueWithSign, tableDataClass }) => {


    return (
        <>
            <tr>
                <td >
                    <span className="d-block small-grey-text"></span>
                    <span className="d-block small-grey-text"></span>
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
                                <div className={`d-flex`}>
                                    <span className="d-inline-block w-50">
                                        {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.aValue.applicability : '')}
                                    </span>{' '}
                                    <span className="d-inline-block w-50">
                                        {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.aValue.percentage : '')}
                                    </span>
                                    <span className="d-inline-block w-50">
                                        {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.aValue.value : '')}
                                    </span>
                                </div>
                                <div /* style={pdfHead ? { marginTop: '-4px' } : {}} className={`d-flex ${highlighter(["overheadOn", "overheadValue"], "multiple-key")}`} */>
                                    <span className="d-inline-block w-50 small-grey-text">
                                        { }
                                    </span>
                                    <span className="d-inline-block w-50 small-grey-text">
                                        { }
                                    </span>{' '}
                                    <span className="d-inline-block w-50 small-grey-text">
                                        {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.CostingPartDetails?.CostingTCOResponse?.CalculatedIncoTermValue : '')}
                                    </span>
                                </div>
                                <div /* style={pdfHead ? { marginTop: '-4px' } : {}} className={`d-flex ${highlighter(["overheadOn", "overheadValue"], "multiple-key")}`} */>
                                    <span className="d-inline-block w-50 small-grey-text">
                                        { }
                                    </span>
                                    <span className="d-inline-block w-50 small-grey-text">
                                        { }
                                    </span>{' '}
                                    <span className="d-inline-block w-50 small-grey-text">
                                        {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.CostingPartDetails?.CostingTCOResponse?.CalculatedWarrantyValue : '')}
                                    </span>
                                </div>
                                <div /* style={pdfHead ? { marginTop: '-4px' } : {}} className={`d-flex ${highlighter(["overheadOn", "overheadValue"], "multiple-key")}`} */>
                                    <span className="d-inline-block w-50 small-grey-text">
                                        { }
                                    </span>
                                    <span className="d-inline-block w-50 small-grey-text">
                                        { }
                                    </span>{' '}
                                    <span className="d-inline-block w-50 small-grey-text">
                                        {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.CostingPartDetails?.CostingTCOResponse?.CalculatedQualityPPMValue : '')}
                                    </span>
                                </div>
                                <div /* style={pdfHead ? { marginTop: '-4px' } : {}} className={`d-flex ${highlighter(["overheadOn", "overheadValue"], "multiple-key")}`} */>
                                    <span className="d-inline-block w-50 small-grey-text">
                                        { }
                                    </span>
                                    <span className="d-inline-block w-50 small-grey-text">
                                        { }
                                    </span>{' '}
                                    <span className="d-inline-block w-50 small-grey-text">
                                        {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.CostingPartDetails?.CostingTCOResponse?.MOQ : '')}
                                    </span>
                                </div>
                                <div /* style={pdfHead ? { marginTop: '-4px' } : {}} className={`d-flex ${highlighter(["overheadOn", "overheadValue"], "multiple-key")}`} */>
                                    <span className="d-inline-block w-50 small-grey-text">
                                        { }
                                    </span>
                                    <span className="d-inline-block w-50 small-grey-text">
                                        { }
                                    </span>{' '}
                                    <span className="d-inline-block w-50 small-grey-text">
                                        {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.CostingPartDetails?.CostingTCOResponse?.SPQ : '')}
                                    </span>
                                </div>
                                <div /* style={pdfHead ? { marginTop: '-4px' } : {}} className={`d-flex ${highlighter(["overheadOn", "overheadValue"], "multiple-key")}`} */>
                                    <span className="d-inline-block w-50 small-grey-text">
                                        { }
                                    </span>
                                    <span className="d-inline-block w-50 small-grey-text">
                                        { }
                                    </span>{' '}
                                    <span className="d-inline-block w-50 small-grey-text">
                                        {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.CostingPartDetails?.CostingTCOResponse?.LeadTime : '')}
                                    </span>
                                </div>
                                <div /* style={pdfHead ? { marginTop: '-4px' } : {}} className={`d-flex ${highlighter(["overheadOn", "overheadValue"], "multiple-key")}`} */>
                                    <span className="d-inline-block w-50 small-grey-text">
                                        { }
                                    </span>
                                    <span className="d-inline-block w-50 small-grey-text">
                                        { }
                                    </span>{' '}
                                    <span className="d-inline-block w-50 small-grey-text">
                                        {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.CostingPartDetails?.CostingTCOResponse?.LdClause : '')}
                                    </span>
                                </div>
                                <div /* style={pdfHead ? { marginTop: '-4px' } : {}} className={`d-flex ${highlighter(["overheadOn", "overheadValue"], "multiple-key")}`} */>
                                    <span className="d-inline-block w-50 small-grey-text">
                                        { }
                                    </span>
                                    <span className="d-inline-block w-50 small-grey-text">
                                        { }
                                    </span>{' '}
                                    <span className="d-inline-block w-50 small-grey-text">
                                        {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.CostingPartDetails?.CostingTCOResponse?.AvailableCapacity : '')}
                                    </span>
                                </div>
                            </td>

                        )
                    })}
            </tr>

        </>
    );
};

export default ViewTcoDetail;
