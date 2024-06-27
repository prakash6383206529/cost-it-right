import React, { useState } from 'react';
import { VARIANCE } from '../../../../../config/constants';
import { useSelector } from 'react-redux';
import { checkForDecimalAndNull } from '../../../../../helper';
import PartSpecificationDrawer from '../../PartSpecificationDrawer';

const ViewTcoDetail = ({ isApproval, viewCostingData, isRfqCosting, highlighter, displayValueWithSign, tableDataClass, pdfHead }) => {
    const { initialConfiguration } = useSelector(state => state.auth)
    const [ openSpecificationDrawer, setOpenSpecificationDrawer ] = useState(false);
    const renderSpan = (text) => (
        <span title={text} className={`w-50 text-wrapped small-grey-text ${isApproval && viewCostingData?.length > 1 ? '' : ''}`}>
            {text}
        </span>
    );

    const renderDiv = (content) => (
        <div style={pdfHead ? { marginTop: '-4px' } : {}} className={`d-flex ${highlighter(["overheadOn", "overheadValue"], "multiple-key")}`}>
            {content}
        </div>
    );
    const handleOpenSpecificationDrawer = () => {
        
        setOpenSpecificationDrawer(true);
    };
    const closeSpecificationDrawer = () => {
        setOpenSpecificationDrawer(false);
    };

    return (
        <>
            <tr>
                <td>
                <span className="d-block small-grey-text">
                        Part Specification
                        <button className="Balance mb-0" type="button" onClick={handleOpenSpecificationDrawer}>
                            
                        </button>
                    </span>
                    <span className="d-block small-grey-text"></span>
                    <span className="d-block small-grey-text"></span>
                    <>
                   
                        <span className="d-block small-grey-text">Inco Terms</span>
                        <span className="d-block small-grey-text">Payment Term</span>
                        <span className="d-block small-grey-text">Warranty Year</span>
                        <span className="d-block small-grey-text">Quality PPM</span>
                        <span className="d-block small-grey-text">MOQ</span>
                        <span className="d-block small-grey-text">SPQ</span>
                        <span className="d-block small-grey-text">Lead Time</span>
                        <span className="d-block small-grey-text">LD Clause</span>
                        <span className="d-block small-grey-text">Available Capacity</span>
                        <span className="d-block small-grey-text">Investment Cost</span>
                    </>
                </td>
                {viewCostingData && viewCostingData.map((data, index) => {

                    const { CostingTCOResponse, CostingPaymentTermDetails } = data?.CostingPartDetails || {};

                    const { PaymentTermDetail } = CostingPaymentTermDetails || {}

                    return (
                        <td className={tableDataClass(data)} key={index}>
                             {renderDiv([
                                renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE 
                                    ? <div onClick={() => handleOpenSpecificationDrawer(data.PartId)} className={'link'}>View Specifications</div> 
                                    : '-'))
                            ])}
                            <div className="d-flex">
                                {renderSpan((data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.aValue.applicability : '-')))}
                                {renderSpan((data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.aValue.percentage : '-')))}
                                {renderSpan((data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.aValue.value : '-')))}
                            </div>
                              
                            {renderDiv([
                                renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? (CostingTCOResponse && CostingTCOResponse?.IncoTerms) ?? '-' : '')),
                                renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? (CostingTCOResponse && CostingTCOResponse?.IncoTermsValue) ?? '-' : '')),
                                renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? (CostingTCOResponse && checkForDecimalAndNull(CostingTCOResponse?.CalculatedIncoTermValue, initialConfiguration.NoOfDecimalForPrice)) ?? '-' : ''))
                            ])}
                            {renderDiv([
                                renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? (PaymentTermDetail && PaymentTermDetail.PaymentTermApplicability) ?? '-' : '')),
                                renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? (PaymentTermDetail && PaymentTermDetail.RepaymentPeriod) ? PaymentTermDetail.RepaymentPeriod + " Days" : '-' : '')),
                                renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? (PaymentTermDetail && checkForDecimalAndNull(PaymentTermDetail?.NetCost, initialConfiguration.NoOfDecimalForPrice)) ?? '-' : ''))
                            ])}
                            {renderDiv([
                                renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? (CostingTCOResponse && CostingTCOResponse?.WarrantyYearCount) ? CostingTCOResponse.WarrantyYearCount + " Years" : '-' : '')),
                                renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? (CostingTCOResponse && CostingTCOResponse?.PreferredWarrantyYear) ?? '-' : '')),
                                renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? (CostingTCOResponse && checkForDecimalAndNull(CostingTCOResponse?.CalculatedWarrantyValue, initialConfiguration.NoOfDecimalForPrice)) ?? '-' : ''))
                            ])}
                            {renderDiv([
                                renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? (CostingTCOResponse && CostingTCOResponse?.QualityPPM) ? CostingTCOResponse?.QualityPPM : '-' : '')),

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
                            {renderDiv([
                                renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? '-' : '')),
                                renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? '-' : '')),
                                renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.netNpvCost, initialConfiguration.NoOfDecimalForPrice) ?? '-' : ''))
                            ])}
                        </td>
                    );
                })}
            </tr>
            {openSpecificationDrawer && <PartSpecificationDrawer
        isOpen={openSpecificationDrawer}
        closeDrawer={closeSpecificationDrawer}
        anchor={'right'}
        // partNo={costData.PartNumber}
        // partId={costData.PartId}
        // viewSpecification={true}
        // quotationId = {quotationDetailPage?.data?.rowData?.QuotationId}
     

      />
      }
        </>
      
    );
};

export default ViewTcoDetail;
