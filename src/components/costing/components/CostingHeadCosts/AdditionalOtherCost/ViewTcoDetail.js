import React, { useEffect, useState } from 'react';
import { ASSEMBLYNAME, COMPONENT_PART, TOOLINGPART, VARIANCE } from '../../../../../config/constants';
import { useSelector } from 'react-redux';
import { checkForDecimalAndNull } from '../../../../../helper';
import PartSpecificationDrawer from '../../PartSpecificationDrawer';

const ViewTcoDetail = ({ isApproval, viewCostingData, isRfqCosting, highlighter, displayValueWithSign, tableDataClass, pdfHead }) => {

    const { initialConfiguration } = useSelector(state => state.auth)
    const [openSpecificationDrawer, setOpenSpecificationDrawer] = useState(false);
    const [baseCostingId, setBaseCostingId] = useState([])
    const [showTCOFields, setShowTCOFields] = useState({ incoTerms: true, warrantyTerms: true, paymentTerms: false, qualityPPM: true, investment: true })

    const defineVisibility = () => {

        switch (viewCostingData[0]?.partType) {
            case COMPONENT_PART:
                setShowTCOFields(prevState => ({ ...prevState, incoTerms: true, warrantyTerms: true, paymentTerms: false, qualityPPM: true, investment: true }))
                break;
            case ASSEMBLYNAME:
                setShowTCOFields(prevState => ({ ...prevState, incoTerms: true, warrantyTerms: true, paymentTerms: false, qualityPPM: true, investment: true }))
                break;
            case TOOLINGPART:

                setShowTCOFields(prevState => ({ ...prevState, incoTerms: true, warrantyTerms: true, paymentTerms: true, qualityPPM: false, investment: false }))
                break;

            default:
                break;
        }

    }
    useEffect(() => {
        defineVisibility()
    }, [viewCostingData])

    const renderSpan = (text) => (
        <span className={`w-50 text-wrapped small-grey-text ${isApproval && viewCostingData?.length > 1 ? '' : ''}`}>
            <span title={text}>{text}</span>
        </span>
    );

    const renderDiv = (content) => (
        <div style={pdfHead ? { marginTop: '-4px' } : {}} className={`d-flex ${highlighter(["overheadOn", "overheadValue"], "multiple-key")}`}>
            {content}
        </div>
    );
    const handleOpenSpecificationDrawerMutiple = () => {
        let costingIds = viewCostingData
            .map(item => item.AssemblyCostingId)
            .filter(id => id !== null && id !== undefined && id !== '-');
        setBaseCostingId(costingIds)
        setOpenSpecificationDrawer(true);
    };
    const handleOpenSpecificationDrawerSingle = (id) => {
        setBaseCostingId([id])
        setOpenSpecificationDrawer(true);
    }
    const closeSpecificationDrawer = () => {
        setOpenSpecificationDrawer(false);
    };

    return (
        <>
            <tr>
                <td>
                    <span className="d-block small-grey-text p-relative">
                        Part Specification
                        <button className="Balance mb-0 button-stick" type="button" onClick={() => handleOpenSpecificationDrawerMutiple()} >
                        </button>
                    </span>
                    <span className="d-block small-grey-text"></span>
                    <span className="d-block small-grey-text"></span>
                    {initialConfiguration?.IsShowTCO && <>

                        {showTCOFields?.incoTerms && <span className="d-block small-grey-text">Inco Terms</span>}
                        {showTCOFields?.paymentTerms && <span className="d-block small-grey-text">Payment Term</span>}
                        {showTCOFields?.warrantyTerms && <span className="d-block small-grey-text">Warranty Year</span>}
                        {showTCOFields?.qualityPPM && <span className="d-block small-grey-text">Quality PPM</span>}
                        <span className="d-block small-grey-text">MOQ</span>
                        <span className="d-block small-grey-text">SPQ</span>
                        <span className="d-block small-grey-text">Lead Time</span>
                        <span className="d-block small-grey-text">LD Clause</span>
                        <span className="d-block small-grey-text">UOM</span>
                        <span className="d-block small-grey-text">Available Capacity</span>
                        {showTCOFields?.investment && <span className="d-block small-grey-text">Investment Cost</span>}
                    </>}
                </td>
                {viewCostingData && viewCostingData.map((data, index) => {

                    const { CostingTCOResponse, CostingPaymentTermDetails } = data?.CostingPartDetails || {};

                    const { PaymentTermDetail } = CostingPaymentTermDetails || {}


                    return (
                        <td className={tableDataClass(data)} key={index}>
                            {renderDiv([
                                renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE
                                    ? <div onClick={() => handleOpenSpecificationDrawerSingle(data.AssemblyCostingId)} className={'link'}>View Specifications</div>
                                    : '-'))
                            ])}
                            {
                                initialConfiguration?.IsShowTCO && <>
                                    <div className="d-flex">
                                        {renderSpan((data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.aValue.applicability : '-')))}
                                        {renderSpan((data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.aValue.percentage : '-')))}
                                        {renderSpan((data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.aValue.value : '-')))}
                                    </div>

                                    {showTCOFields?.incoTerms && renderDiv([
                                        renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? (CostingTCOResponse && CostingTCOResponse?.IncoTerms) ?? '-' : '')),
                                        renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? (CostingTCOResponse && CostingTCOResponse?.IncoTermsValue) ?? '-' : '')),
                                        renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? (CostingTCOResponse && checkForDecimalAndNull(CostingTCOResponse?.CalculatedIncoTermValue, initialConfiguration.NoOfDecimalForPrice)) ?? '-' : ''))
                                    ])}
                                    {showTCOFields?.paymentTerms && renderDiv([
                                        renderSpan(data?.bestCost === true ? '' : (data?.CostingHeading !== VARIANCE ? (PaymentTermDetail && PaymentTermDetail?.PaymentTermApplicability) ? PaymentTermDetail?.PaymentTermApplicability : '-' : '-')),
                                        renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? (PaymentTermDetail && PaymentTermDetail?.RepaymentPeriod) ? PaymentTermDetail?.RepaymentPeriod + " Days" : '-' : '')),
                                        renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? (PaymentTermDetail && checkForDecimalAndNull(PaymentTermDetail?.NetCost, initialConfiguration.NoOfDecimalForPrice)) ?? '-' : ''))
                                    ])}
                                    {showTCOFields?.warrantyTerms && renderDiv([
                                        renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? (CostingTCOResponse && CostingTCOResponse?.WarrantyYearCount) ? CostingTCOResponse.WarrantyYearCount + " Years" : '-' : '')),
                                        renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? (CostingTCOResponse && CostingTCOResponse?.PreferredWarrantyYear) ?? '-' : '')),
                                        renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? (CostingTCOResponse && checkForDecimalAndNull(CostingTCOResponse?.CalculatedWarrantyValue, initialConfiguration.NoOfDecimalForPrice)) ?? '-' : ''))
                                    ])}
                                    {showTCOFields?.qualityPPM && renderDiv([
                                        renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? (CostingTCOResponse && CostingTCOResponse?.QualityPPM) ? CostingTCOResponse?.QualityPPM : '-' : '')),

                                        renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? '-' : '')),
                                        renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? (CostingTCOResponse && checkForDecimalAndNull(CostingTCOResponse?.CalculatedQualityPPMValue, initialConfiguration.NoOfDecimalForPrice)) ?? '-' : ''))])}
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
                                        renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? (CostingTCOResponse && CostingTCOResponse?.UOMSymbol) ?? '-' : ''))
                                    ])}
                                    {renderDiv([
                                        renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? '-' : '')),
                                        renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? '-' : '')),
                                        renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? (CostingTCOResponse && CostingTCOResponse?.AvailableCapacity) ?? '-' : ''))
                                    ])}
                                    {showTCOFields?.investment && renderDiv([
                                        renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? '-' : '')),
                                        renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? '-' : '')),
                                        renderSpan(data?.bestCost === true ? ' ' : (data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.netNpvCost, initialConfiguration.NoOfDecimalForPrice) ?? '-' : ''))
                                    ])}
                                </>
                            }

                        </td>
                    );
                })}
            </tr>
            {openSpecificationDrawer && <PartSpecificationDrawer
                isOpen={openSpecificationDrawer}
                closeDrawer={closeSpecificationDrawer}
                anchor={'right'}
                baseCostingId={baseCostingId}
                partType={viewCostingData[0]?.partType}
            />
            }
        </>

    );
};

export default ViewTcoDetail;
