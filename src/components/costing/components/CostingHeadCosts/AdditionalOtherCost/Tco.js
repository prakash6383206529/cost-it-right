import React, { useContext, useEffect, useState } from 'react';
import { Col, Row } from 'reactstrap';
// import { useForm, Controller, useWatch } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { SearchableSelectHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs';
import { number, checkWhiteSpaces } from '../../../../../helper/validation';
import TooltipCustom from '../../../../common/Tooltip';
import { getCostingPaymentTermDetail, getCostingTcoDetails } from '../../../actions/Costing';
import { useForm, Controller } from 'react-hook-form'
import { ASSEMBLYNAME, COMPONENT_PART, TOOLINGPART } from '../../../../../config/constants';
const Tco = (props) => {
    const { costingId } = props

    const dispatch = useDispatch();
    const { getTcoDetails, getCostingPaymentDetails, RMCCTabData } = useSelector(state => state.costing)

    const { register, control, setValue, getValues, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })

    const tabData = (RMCCTabData && RMCCTabData.length > 0) ? RMCCTabData[0] : (props?.partType ?? '')
    const [incoTermlist, setIncoTermlist] = useState([])
    const [showTCOFields, setShowTCOFields] = useState({ incoTerms: true, warrantyTerms: true, paymentTerms: false, qualityPPM: true, investment: true, UOM: true })

    useEffect(() => {
        defineVisibility()
    }, [])

    useEffect(() => {
        dispatch(getCostingTcoDetails(costingId, () => { }))
        dispatch(getCostingPaymentTermDetail(costingId, () => { }))

    }, [costingId])
    useEffect(() => {
        if (getTcoDetails) {
            const PaymentDays = getCostingPaymentDetails?.PaymentTermDetail ? getCostingPaymentDetails?.PaymentTermDetail.RepaymentPeriod : 0
            setValue('Warranty', getTcoDetails.WarrantyYearCount);
            setValue('QualityPPM', getTcoDetails.QualityPPM);
            setValue('AvailableCapacity', getTcoDetails.AvailableCapacity);
            setValue('Spq', getTcoDetails.SPQ);
            setValue('Moq', getTcoDetails.MOQ);
            setValue('LeadTime', getTcoDetails.LeadTime);
            setValue('PaymentDays', PaymentDays ?? '');
            let incoTermObj = {
                label: getTcoDetails.IncoTerms,
                value: getTcoDetails.IncoTermsValue,
                id: getTcoDetails.IncoTermsIdRef
            }
            setValue('IncoTerms', incoTermObj.label ? incoTermObj : '');
            setValue('Uom', getTcoDetails?.UOMSymbol ? { label: getTcoDetails?.UOMSymbol, value: getTcoDetails.UOMIdRef } : '')
            setIncoTermlist(incoTermObj)
            // Object.keys(getTcoDetails).forEach(key => {
            //     setValue(key, getTcoDetails[key]);
            // });
        }
    }, [getTcoDetails, setValue, getCostingPaymentDetails]);


    const defineVisibility = () => {
        switch (tabData?.PartType) {
            case COMPONENT_PART:
                setShowTCOFields(prevState => ({ ...prevState, incoTerms: true, warrantyTerms: true, paymentTerms: true, qualityPPM: true, investment: true, capacity: true, MOQ: true, SPQ: true, UOM: true }))
                break;
            case ASSEMBLYNAME:
                setShowTCOFields(prevState => ({ ...prevState, incoTerms: true, warrantyTerms: true, paymentTerms: true, qualityPPM: true, investment: true, capacity: true, MOQ: true, SPQ: true, UOM: true }))
                break;
            case TOOLINGPART:
                setShowTCOFields(prevState => ({ ...prevState, incoTerms: true, warrantyTerms: false, paymentTerms: false, qualityPPM: false, investment: false, capacity: false, MOQ: false, SPQ: false, UOM: false }))
                break;

            default:
                break;
        }

    }

    return (
        <Row>
            {showTCOFields?.incoTerms && <Col md="3" >
                <SearchableSelectHookForm
                    id="IncoTerms_Container"
                    label={'Inco Terms'}
                    name={'IncoTerms'}
                    placeholder={'Select'}
                    Controller={Controller}
                    control={control}
                    rules={{ required: true }}
                    register={register}
                    defaultValue={incoTermlist.length === 0 ? null : incoTermlist}
                    disabled={true}
                    // options={renderListing("IncoTerms")}
                    customClassName={'mb-0'}
                    mandatory={false}
                    errors={errors.IncoTerms}

                />
            </Col>}
            {showTCOFields?.warrantyTerms && <Col md="3" >
                <TooltipCustom id="Warranty" tooltipText="The preferred warranty duration is 3 years." />
                <TextFieldHookForm
                    id="WarrantyYear_Conrainer"
                    label={`Warranty Year (No)`}
                    name={'Warranty'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    rules={{
                        required: true,
                        validate: { number, checkWhiteSpaces },
                    }}
                    mandatory={false}
                    disabled={true}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.Warranty}
                />

            </Col>}


            {showTCOFields?.qualityPPM && <Col md="3" >
                <TooltipCustom id="QualityPPM" tooltipText="The preferred quality PPM is 3000." />
                <TextFieldHookForm
                    id="QualityPPM_Container"
                    label={`Quality PPM (No)`}
                    name={'QualityPPM'}
                    Controller={Controller}
                    control={control}
                    rules={{
                        required: true,
                        validate: { number, checkWhiteSpaces },
                    }}
                    register={register}
                    mandatory={false}

                    disabled={true}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.QualityPPM}

                />
            </Col>}
            {showTCOFields?.paymentTerms && <Col md="3" >
                <TooltipCustom id="paymentDays" tooltipText="The preferred payment term is 90 days." />
                <TextFieldHookForm
                    id="paymentDays_Container"
                    label={`Payment Term (Days)`}
                    name={'PaymentDays'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    rules={{
                        required: true,
                        validate: { number, checkWhiteSpaces },
                    }}
                    mandatory={false}

                    disabled={true}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.PaymentDays}
                />

            </Col>}
            <Col md="3">
                <TextFieldHookForm
                    label={`MOQ (No)`}
                    name={'Moq'}
                    Controller={Controller}
                    id={'Moq_Container'}
                    control={control}
                    register={register}
                    rules={{
                        required: true,
                        validate: { number, checkWhiteSpaces },
                    }}
                    mandatory={false}
                    disabled={true}


                    className=""
                    customClassName={'withBorder'}
                    errors={errors.Moq}

                />
            </Col>
            <Col md="3">
                <TextFieldHookForm
                    label={`SPQ (No)`}
                    name={'Spq'}
                    Controller={Controller}
                    id={'Spq_Container'}
                    control={control}
                    register={register}
                    mandatory={false}
                    rules={{
                        required: true,
                        validate: { number, checkWhiteSpaces },
                    }}
                    disabled={true}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.Spq}

                />
            </Col>
            <Col md="3">
                <TextFieldHookForm
                    label={`Lead Time (Days)`}
                    name={'LeadTime'}
                    Controller={Controller}
                    id={'LeadTime_Container'}
                    control={control}
                    register={register}
                    rules={{
                        required: true,
                        validate: { number, checkWhiteSpaces },
                    }}
                    mandatory={false}
                    disabled={true}


                    className=""
                    customClassName={'withBorder'}
                    errors={errors.LeadTime}

                />
            </Col>
            <Col md="3">
                <SearchableSelectHookForm
                    id="Uom_Container"
                    label={'UOM'}
                    name={'Uom'}
                    placeholder={'Select'}
                    Controller={Controller}
                    control={control}
                    rules={{ required: true }}
                    register={register}

                    customClassName={'mb-0'}
                    mandatory={false}
                    disabled={true}
                    errors={errors.Uom}

                />
            </Col>
            <Col md="3">
                <TextFieldHookForm
                    label={`Available Monthly Capacity (No)`}
                    name={'AvailableCapacity'}
                    Controller={Controller}
                    id={'AvailableCapacity_Container'}
                    control={control}
                    register={register}
                    rules={{
                        required: true,
                        validate: { number, checkWhiteSpaces },
                    }}
                    mandatory={false}
                    disabled={true}


                    className=""
                    customClassName={'withBorder'}
                    errors={errors.AvailableCapacity}

                />
            </Col>


        </Row>

    );
};

Tco.defaultProps = {
    netPOPrice: null,
    costingId: null,
    partType: null
};

export default Tco;