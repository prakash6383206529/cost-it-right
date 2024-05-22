import React from 'react';
import { VARIANCE } from '../../../../../config/constants';

const ViewTcoDetail = ({ isApproval, viewCostingData, isRfqCosting, highlighter, displayValueWithSign, tableDataClass, pdfHead }) => {
    const renderSpan = (text) => {
        return (
            <span className={`w-50 small-grey-text ${isApproval && viewCostingData?.length > 1 ? '' : ''}`}>
                {text}
            </span>
        );
    };

    const renderDiv = (content) => {
        return (
            <div style={pdfHead ? { marginTop: '-4px' } : {}} className={`d-flex ${highlighter(["overheadOn", "overheadValue"], "multiple-key")}`}>
                {content}
            </div>
        );
    };

    return (
        <>
            <tr>
                <td>
                    <span className="d-block small-grey-text"></span>
                    <span className="d-block small-grey-text"></span>
                    <>
                        <span className="d-block small-grey-text">Inco Terms</span>
                        <span className="d-block small-grey-text">Warranty Year</span>
                        <span className="d-block small-grey-text">Quality PPM</span>
                        <span className="d-block small-grey-text">MOQ</span>
                        <span className="d-block small-grey-text">SPQ</span>
                        <span className="d-block small-grey-text">Lead Time</span>
                        <span className="d-block small-grey-text">Ld Clause</span>
                        <span className="d-block small-grey-text">Available Capacity</span>
                    </>
                </td>
                {viewCostingData &&
                    viewCostingData.map((data) => {
                        const { CostingTCOResponse } = data?.CostingPartDetails;
                        return (
                            <td className={tableDataClass(data)}>
                                <div className="d-flex">
                                    {renderSpan((data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.aValue.applicability : '-')))}
                                    {renderSpan((data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.aValue.percentage : '-')))}
                                    {renderSpan((data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.aValue.value : '-')))}
                                </div>
                                {renderDiv([
                                    renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? (CostingTCOResponse && CostingTCOResponse.IncoTermApplicability) ?? '-' : '')),
                                    renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? (CostingTCOResponse && CostingTCOResponse.IncoTermPercentage) ?? '-' : '')),
                                    renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? (CostingTCOResponse && CostingTCOResponse.CalculatedIncoTermValue) ?? '-' : ''))
                                ])}
                                {renderDiv([
                                    renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? '-' : '')),
                                    renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? '-' : '')),
                                    renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? (CostingTCOResponse && CostingTCOResponse?.CalculatedWarrantyValue) ?? '-' : ''))
                                ])}
                                {renderDiv([
                                    renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? '-' : '')),
                                    renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? '-' : '')),
                                    renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? (CostingTCOResponse && CostingTCOResponse?.CalculatedQualityPPMValue) ?? '-' : ''))
                                ])}
                                {renderDiv([
                                    renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? '-' : '')),
                                    renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? '-' : '')),
                                    renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? (CostingTCOResponse && CostingTCOResponse?.MOQ) ?? '-' : ''))
                                ])}
                                {renderDiv([
                                    renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? '-' : '')),
                                    renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? '-' : '')),
                                    renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? (CostingTCOResponse && CostingTCOResponse?.SPQ) ?? '-' : ''))
                                ])}
                                {renderDiv([
                                    renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? '-' : '')),
                                    renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? '-' : '')),
                                    renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? (CostingTCOResponse && CostingTCOResponse?.LeadTime) ?? '-' : ''))
                                ])}
                                {renderDiv([
                                    renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? '-' : '')),
                                    renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? '-' : '')),
                                    renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? (CostingTCOResponse && CostingTCOResponse?.LdClause) ?? '-' : ''))
                                ])}
                                {renderDiv([
                                    renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? '-' : '')),
                                    renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? '-' : '')),
                                    renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? (CostingTCOResponse && CostingTCOResponse?.AvailableCapacity) ?? '-' : ''))
                                ])}
                            </td>
                        );
                    })}
            </tr>
        </>
    );
};

export default ViewTcoDetail;
