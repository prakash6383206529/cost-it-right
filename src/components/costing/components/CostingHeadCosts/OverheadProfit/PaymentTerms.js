import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Row, } from 'reactstrap';
import { SearchableSelectHookForm, TextAreaHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs';
// import { fetchModelTypeAPI, fetchCostingHeadsAPI, getICCAppliSelectListKeyValue, getPaymentTermsAppliSelectListKeyValue } from '../../../../../actions/Common';
import { calculatePercentage, checkForDecimalAndNull, checkForNull, decimalAndNumberValidationBoolean, getConfigurationKey } from '../../../../../helper';
import { getPaymentTermsDataByHeads, gridDataAdded, isOverheadProfitDataChange, isPaymentTermsDataChange, setDiscountAndOtherCostData, setOverheadProfitErrors, setPaymentTermCost, } from '../../../actions/Costing';
import Switch from "react-switch";
import { CBCTypeId, CRMHeads, EMPTY_GUID, NFRTypeId, VBCTypeId, WACTypeId, ZBCTypeId } from '../../../../../config/constants';
import { costingInfoContext, netHeadCostContext } from '../../CostingDetailStepTwo';
import { ViewCostingContext } from '../../CostingDetails';
import DayTime from '../../../../common/DayTimeWrapper';
import WarningMessage from '../../../../common/WarningMessage';
import { MESSAGES } from '../../../../../config/message';
import { number, checkWhiteSpaces, percentageLimitValidation, isNumber, NoSignNoDecimalMessage } from "../../../../../helper/validation";
import Popup from 'reactjs-popup';
import { IdForMultiTechnology, REMARKMAXLENGTH } from '../../../../../config/masterData';
import Toaster from '../../../../common/Toaster';
import { debounce } from 'lodash';
import LoaderCustom from '../../../../common/LoaderCustom';

let counter = 0;
const PaymentTerms = React.memo((props) => {
    const { Controller, control, register, data, setValue, getValues, errors, useWatch, CostingInterestRateDetail, PaymentTermDetail } = props
    const headerCosts = useContext(netHeadCostContext);
    const CostingViewMode = useContext(ViewCostingContext);
    const costData = useContext(costingInfoContext);
    const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
    const { OverheadProfitTabData } = useSelector(state => state.costing)

    const dispatch = useDispatch()
    const { CostingEffectiveDate } = useSelector(state => state.costing)
    const [IsPaymentTermsApplicable, setIsPaymentTermsApplicable] = useState(CostingInterestRateDetail && CostingInterestRateDetail.IsPaymentTerms ? true : false)
    const [paymentTermsApplicability, setPaymentTermsApplicability] = useState(PaymentTermDetail !== undefined ? { label: PaymentTermDetail?.PaymentTermApplicability, value: PaymentTermDetail?.PaymentTermApplicability } : [])
    const [PaymentTermInterestRateId, setPaymentTermInterestRateId] = useState(PaymentTermDetail !== undefined ? PaymentTermDetail.InterestRateId : '')
    const [tempPaymentTermObj, setTempPaymentTermObj] = useState(PaymentTermDetail)


    const [InterestRateFixedLimit, setInterestRateFixedLimit] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [effectiveDate, setEffectiveDate] = useState("")
    const [loader, setLoader] = useState(false)
    // partType USED FOR MANAGING CONDITION IN CASE OF NORMAL COSTING AND ASSEMBLY TECHNOLOGY COSTING (TRUE FOR ASSEMBLY TECHNOLOGY)
    const partType = (IdForMultiTechnology.includes(String(costData?.TechnologyId)) || costData.CostingTypeId === WACTypeId)
    const { getCostingPaymentDetails } = useSelector(state => state.costing);


    const PaymentTermsFieldValues = useWatch({
        control,
        name: ['RepaymentPeriodCost',],
    });

    const PaymentTermsFixedFieldValues = useWatch({
        control,
        name: ['RepaymentPeriodPercentage', 'RepaymentPeriodFixed'],
    });


    useEffect(() => {
        if (PaymentTermDetail) {
            setValue('crmHeadPayment', PaymentTermDetail?.PaymentTermCRMHead ? { label: PaymentTermDetail?.PaymentTermCRMHead, value: 1 } : '')
            setValue('paymentRemark', PaymentTermDetail?.Remark ? PaymentTermDetail.Remark : '')
        }
    }, []);
    useEffect(() => {
        if (props?.showPaymentTerms) {
            setLoader(true)
            setIsPaymentTermsApplicable(!IsPaymentTermsApplicable)
            callPaymentTermAPI(props?.showPaymentTerms)
            dispatch(gridDataAdded(true))
            dispatch(isOverheadProfitDataChange(true))
            if (PaymentTermDetail) {
                setValue('paymentRemark', PaymentTermDetail?.Remark ? PaymentTermDetail?.Remark : '')
            }
        }
    }, [])

    useEffect(() => {
        if (CostingViewMode) {

            setValue('RepaymentPeriodDays', getCostingPaymentDetails?.PaymentTermDetail.RepaymentPeriod);
            const interestRate = getCostingPaymentDetails?.PaymentTermDetail.InterestRate !== null ? getCostingPaymentDetails?.PaymentTermDetail.InterestRate : 0;
            setValue('RepaymentPeriodPercentage', interestRate);
            setValue('RepaymentPeriodFixed', interestRate);
            setValue('paymentRemark', getCostingPaymentDetails?.PaymentTermDetail ? getCostingPaymentDetails?.PaymentTermDetail?.Remark : "");
            setValue('RepaymentPeriodCost', getCostingPaymentDetails?.PaymentTermDetail ? checkForDecimalAndNull(getCostingPaymentDetails?.PaymentTermDetail?.NetCost, initialConfiguration?.NoOfDecimalForPrice) : '')
        }
    }, [IsPaymentTermsApplicable])
    useEffect(() => {
        setTimeout(() => {
            let tempObj = {
                "InterestRateId": paymentTermsApplicability?.label !== 'Fixed' ? (IsPaymentTermsApplicable ? PaymentTermInterestRateId : '') : null,
                "PaymentTermDetailId": IsPaymentTermsApplicable ? PaymentTermDetail?.InterestRateId : '',
                "PaymentTermApplicability": Object.keys(paymentTermsApplicability).length > 0 ? paymentTermsApplicability?.label : '',
                "RepaymentPeriod": IsPaymentTermsApplicable ? getValues('RepaymentPeriodDays') : '',
                "InterestRate": IsPaymentTermsApplicable ? paymentTermsApplicability.label !== 'Fixed' ? getValues('RepaymentPeriodPercentage') : (getValues('RepaymentPeriodFixed')) : '',
                "NetCost": IsPaymentTermsApplicable ? tempPaymentTermObj?.NetCost : '',
                "EffectiveDate": effectiveDate,
                "PaymentTermCRMHead": tempPaymentTermObj?.PaymentTermCRMHead ? tempPaymentTermObj?.PaymentTermCRMHead : '',
                "Remark": tempPaymentTermObj?.Remark ? tempPaymentTermObj?.Remark : '',
                // "ApplicabilityCost": tempPaymentTermObj?.ApplicabilityCost?tempPaymentTermObj?.ApplicabilityCost:"",
            }
            if (!CostingViewMode) {
                //dispatch(setDiscountAndOtherCostData(tempObj, () => { }));
                props.setPaymentTermsDetail(tempObj, { BOMLevel: data?.BOMLevel, PartNumber: data?.PartNumber })
            }
        }, 200)
    }, [tempPaymentTermObj, paymentTermsApplicability, effectiveDate])

    /**
         * @method callPaymentTermAPI
         * @description ON TOGGLE OF PAYEMNT TERMS API CALL
        */

    const callPaymentTermAPI = (isCallAPI) => {


        if (Object.keys(costData).length > 0 && isCallAPI && !CostingViewMode && !getCostingPaymentDetails?.IsPaymentTerms) {
            const getPlantId = () => {
                const configKey = getConfigurationKey();
                if (configKey?.IsPlantRequiredForOverheadProfitInterestRate && costData?.CostingTypeId === ZBCTypeId) {
                    return costData.PlantId;
                } else if ((configKey?.IsDestinationPlantConfigure && costData?.CostingTypeId === VBCTypeId) ||
                    costData?.CostingTypeId === CBCTypeId ||
                    costData?.CostingTypeId === NFRTypeId) {
                    return costData.DestinationPlantId;
                }
                return EMPTY_GUID;
            };

            const reqParams = {
                VendorId: (costData?.CostingTypeId === VBCTypeId || costData?.CostingTypeId === NFRTypeId) ? costData.VendorId : EMPTY_GUID,
                costingTypeId: costData.CostingTypeId === NFRTypeId ? VBCTypeId :
                    costData.CostingTypeId === WACTypeId ? ZBCTypeId :
                        costData.CostingTypeId,
                plantId: getPlantId(),
                customerId: costData?.CostingTypeId === CBCTypeId ? costData.CustomerId : EMPTY_GUID,
                effectiveDate: CostingEffectiveDate ? DayTime(CostingEffectiveDate).format('DD/MM/YYYY') : '',
                rawMaterialGradeId: initialConfiguration?.IsShowRawMaterialInOverheadProfitAndICC ? OverheadProfitTabData[0]?.CostingPartDetails?.RawMaterialGradeId : EMPTY_GUID,
                rawMaterialChildId: initialConfiguration?.IsShowRawMaterialInOverheadProfitAndICC ? OverheadProfitTabData[0]?.CostingPartDetails?.RawMaterialChildId : EMPTY_GUID,
                technologyId: null,
            };
            dispatch(getPaymentTermsDataByHeads(reqParams, res => {
                if (res && res.data && res.data.Result) {
                    setLoader(false)
                    let Data = res.data.Data;
                    setValue('RepaymentPeriodDays', Data.RepaymentPeriod)
                    setValue('RepaymentPeriodPercentage', Data.InterestRate !== null ? Data.InterestRate : 0)
                    setValue('RepaymentPeriodFixed', Data.InterestRate !== null ? Data.InterestRate : 0)
                    setPaymentTermInterestRateId(Data.InterestRateId !== EMPTY_GUID ? Data.InterestRateId : null)
                    checkPaymentTermApplicability(Data?.PaymentTermApplicability)
                    setPaymentTermsApplicability({ label: Data?.PaymentTermApplicability, value: Data?.PaymentTermApplicability })
                } else if (res.status === 204) {
                    setLoader(false)
                    setValue('RepaymentPeriodDays', '')
                    setValue('RepaymentPeriodPercentage', '')
                    setValue('RepaymentPeriodCost', '')
                    setValue('RepaymentPeriodFixed', '')
                    checkPaymentTermApplicability('')
                    setPaymentTermsApplicability([])
                }

            }))

        } else if (getCostingPaymentDetails?.IsPaymentTerms) {
            setLoader(false)
            setValue('RepaymentPeriodDays', getCostingPaymentDetails?.PaymentTermDetail.RepaymentPeriod);
            const interestRate = getCostingPaymentDetails?.PaymentTermDetail.InterestRate !== null ? getCostingPaymentDetails?.PaymentTermDetail.InterestRate : 0;
            setValue('RepaymentPeriodPercentage', interestRate);
            setValue('RepaymentPeriodFixed', interestRate);
            setValue('paymentRemark', getCostingPaymentDetails?.PaymentTermDetail ? getCostingPaymentDetails?.PaymentTermDetail?.Remark : "");
            setValue('RepaymentPeriodCost', getCostingPaymentDetails?.PaymentTermDetail ? checkForDecimalAndNull(getCostingPaymentDetails?.PaymentTermDetail?.NetCost, initialConfiguration?.NoOfDecimalForPrice) : '')
            // setValue('ApplicabilityCost', getCostingPaymentDetails? checkForDecimalAndNull(getCostingPaymentDetails?.ApplicabilityCost, initialConfiguration?.NoOfDecimalForPrice) : '')
            setPaymentTermInterestRateId(getCostingPaymentDetails?.PaymentTermDetail?.InterestRateId !== EMPTY_GUID ? getCostingPaymentDetails?.PaymentTermDetail.InterestRateId : null);
            checkPaymentTermApplicability(getCostingPaymentDetails?.PaymentTermDetail?.PaymentTermApplicability);
            setPaymentTermsApplicability({ label: getCostingPaymentDetails?.PaymentTermDetail?.PaymentTermApplicability, value: getCostingPaymentDetails?.PaymentTermDetail?.PaymentTermApplicability });
        }

        else {
            setPaymentTermsApplicability([])
            if (!CostingViewMode) {
                //dispatch(setDiscountAndOtherCostData(null, () => { }));

                props.setPaymentTermsDetail(null, { BOMLevel: data.BOMLevel, PartNumber: data.PartNumber })
            }
            setLoader(false)

        }
    }




    // //USEEFFECT CALLED FOR FIXED VALUES SELECTED IN DROPDOWN
    useEffect(() => {

        checkPaymentTermApplicability(paymentTermsApplicability.label)

    }, [PaymentTermsFixedFieldValues])

    /**
      * @method checkPaymentTermApplicability
      * @description PAYMENT TERMS APPLICABILITY CALCULATION
      */
    const checkPaymentTermApplicability = (Text) => {
        if (headerCosts !== undefined && Text !== '' && !CostingViewMode) {
            const ConversionCostForCalculation = costData.IsAssemblyPart ? checkForNull(headerCosts.NetConversionCost) - checkForNull(headerCosts.TotalOtherOperationCostPerAssembly) : headerCosts.NetProcessCost + headerCosts.NetOperationCost
            const RMBOPCC = headerCosts.NetRawMaterialsCost + headerCosts.NetBoughtOutPartCost + ConversionCostForCalculation
            const RMBOP = headerCosts.NetRawMaterialsCost + headerCosts.NetBoughtOutPartCost;
            const RMCC = headerCosts.NetRawMaterialsCost + ConversionCostForCalculation;
            const BOPCC = headerCosts.NetBoughtOutPartCost + ConversionCostForCalculation;
            const TotalCost = checkForNull(data?.totalCost) - checkForNull(data?.NetDiscountsCost ? data?.NetDiscountsCost : data?.HundiOrDiscountValue) + checkForNull(data?.AnyOtherCost)
            const RepaymentPeriodDays = getValues('RepaymentPeriodDays')
            const RepaymentPeriodPercentage = getValues('RepaymentPeriodPercentage')
            const RepaymentCost = (calculatePercentage(RepaymentPeriodPercentage) / 90) * RepaymentPeriodDays;
            let obj = {}
            switch (Text) {
                case 'RM':
                case 'Part Cost':
                    if ((partType && Text === 'Part Cost') || (!partType && Text === 'RM')) {
                        setValue('RepaymentPeriodCost', checkForDecimalAndNull((headerCosts.NetRawMaterialsCost * RepaymentCost), initialConfiguration?.NoOfDecimalForPrice))
                        setTempPaymentTermObj({
                            ...tempPaymentTermObj,
                            NetCost: checkForNull(headerCosts?.NetRawMaterialsCost * RepaymentCost),
                            // ApplicabilityCost: checkForNull(headerCosts?.NetRawMaterialsCost)tabDisc
                        })
                        obj = {
                            ...tempPaymentTermObj,
                            NetCost: checkForNull(headerCosts?.NetRawMaterialsCost * RepaymentCost),
                            // ApplicabilityCost: checkForNull(headerCosts?.NetRawMaterialsCost)

                        }
                    }
                    break;

                case 'BOP':
                    setValue('RepaymentPeriodCost', checkForDecimalAndNull((headerCosts.NetBoughtOutPartCost * RepaymentCost), initialConfiguration?.NoOfDecimalForPrice))
                    setTempPaymentTermObj({
                        ...tempPaymentTermObj,
                        NetCost: checkForNull(headerCosts.NetBoughtOutPartCost * RepaymentCost),
                        // ApplicabilityCost: checkForNull(headerCosts?.NetBoughtOutPartCost)
                    })
                    obj = {
                        ...tempPaymentTermObj,
                        NetCost: checkForNull(headerCosts.NetBoughtOutPartCost * RepaymentCost),
                        // ApplicabilityCost: checkForNull(headerCosts?.NetBoughtOutPartCost)
                    }
                    break;

                case 'CC':
                    setValue('RepaymentPeriodCost', checkForDecimalAndNull((ConversionCostForCalculation * RepaymentCost), initialConfiguration?.NoOfDecimalForPrice))
                    setTempPaymentTermObj({
                        ...tempPaymentTermObj,
                        NetCost: checkForNull(ConversionCostForCalculation * RepaymentCost),
                        // ApplicabilityCost: checkForNull(ConversionCostForCalculation)
                    })
                    obj = {
                        ...tempPaymentTermObj,
                        NetCost: checkForNull(ConversionCostForCalculation * RepaymentCost),
                        // ApplicabilityCost: checkForNull(ConversionCostForCalculation)
                    }
                    break;

                case 'RM + CC':
                case 'Part Cost + CC':
                    if ((partType && Text === 'Part Cost + CC') || (!partType && Text === 'RM + CC')) {
                        setValue('RepaymentPeriodCost', checkForDecimalAndNull((RMCC * RepaymentCost), initialConfiguration?.NoOfDecimalForPrice))
                        setTempPaymentTermObj({
                            ...tempPaymentTermObj,
                            NetCost: checkForNull(RMCC * RepaymentCost),
                            // ApplicabilityCost: checkForNull(RMCC)
                        })
                        obj = {
                            ...tempPaymentTermObj,
                            NetCost: checkForNull(RMCC * RepaymentCost),
                            // ApplicabilityCost: checkForNull(RMCC)
                        }
                    }
                    break;

                case 'RM + BOP':
                case 'Part Cost + BOP':
                    if ((partType && Text === 'Part Cost + BOP') || (!partType && Text === 'RM + BOP')) {
                        setValue('RepaymentPeriodCost', checkForDecimalAndNull((RMBOP * RepaymentCost), initialConfiguration?.NoOfDecimalForPrice))
                        setTempPaymentTermObj({
                            ...tempPaymentTermObj,
                            NetCost: checkForNull(RMBOP * RepaymentCost),
                            // ApplicabilityCost: checkForNull(RMBOP)
                        })
                        obj = {
                            ...tempPaymentTermObj,
                            NetCost: checkForNull(RMBOP * RepaymentCost),
                            // ApplicabilityCost: checkForNull(RMBOP)
                        }
                    }
                    break;

                case 'BOP + CC':
                    setValue('RepaymentPeriodCost', checkForDecimalAndNull((BOPCC * RepaymentCost), initialConfiguration?.NoOfDecimalForPrice))

                    setTempPaymentTermObj({
                        ...tempPaymentTermObj,
                        NetCost: checkForNull(BOPCC * RepaymentCost),
                        // ApplicabilityCost: checkForNull(BOPCC)
                    })
                    obj = {
                        ...tempPaymentTermObj,
                        NetCost: checkForNull(BOPCC * RepaymentCost),
                        // ApplicabilityCost: checkForNull(BOPCC)
                    }
                    break;

                case 'RM + CC + BOP':
                case 'Part Cost + CC + BOP':
                    if ((partType && Text === 'Part Cost + CC + BOP') || (!partType && Text === 'RM + CC + BOP')) {
                        setValue('RepaymentPeriodCost', checkForDecimalAndNull(((RMBOPCC) * RepaymentCost), initialConfiguration?.NoOfDecimalForPrice))

                        setTempPaymentTermObj({
                            ...tempPaymentTermObj,
                            NetCost: checkForNull(RMBOPCC * RepaymentCost),
                            // ApplicabilityCost: checkForNull(RMBOPCC)
                        })
                        obj = {
                            ...tempPaymentTermObj,
                            NetCost: checkForNull(RMBOPCC * RepaymentCost),
                            // ApplicabilityCost: checkForNull(RMBOPCC)
                        }
                    }
                    break;

                case 'Fixed':
                    setValue('RepaymentPeriodCost', checkForDecimalAndNull(getValues("RepaymentPeriodFixed"), initialConfiguration?.NoOfDecimalForPrice))

                    setTempPaymentTermObj({
                        ...tempPaymentTermObj,
                        NetCost: checkForNull(getValues("RepaymentPeriodFixed"))
                    })
                    obj = {
                        ...tempPaymentTermObj,
                        NetCost: checkForNull(getValues("RepaymentPeriodFixed")),
                    }
                    break;

                case 'Annual ICC (%)':
                    setValue('RepaymentPeriodCost', checkForDecimalAndNull((RMBOPCC * RepaymentCost), initialConfiguration?.NoOfDecimalForPrice)) //NEED TO ASK HERE ALSO

                    setTempPaymentTermObj({
                        ...tempPaymentTermObj,
                        NetCost: checkForNull(RMBOPCC * RepaymentCost),
                        // ApplicabilityCost: checkForNull(RMBOPCC)
                    })
                    obj = {
                        ...tempPaymentTermObj,
                        NetCost: checkForNull(RMBOPCC * RepaymentCost),
                        // ApplicabilityCost: checkForNull(RMBOPCC)

                    }
                    break;

                case 'Total Cost + Other Cost - Discount':

                    setValue('RepaymentPeriodCost', checkForDecimalAndNull(checkForNull(TotalCost) * checkForNull(RepaymentCost), initialConfiguration?.NoOfDecimalForPrice))
                    setTempPaymentTermObj({
                        ...tempPaymentTermObj,
                        NetCost: checkForNull(TotalCost) * checkForNull(RepaymentCost),
                        // ApplicabilityCost: checkForNull(TotalCost)
                    })
                    obj = {
                        ...tempPaymentTermObj,
                        NetCost: checkForNull(TotalCost) * checkForNull(RepaymentCost),
                        // ApplicabilityCost: checkForNull(TotalCost)
                    }
                    break;

                default:
                    break;
            }

            //dispatch(setDiscountAndOtherCostData(tempObj, () => { }));
            dispatch(setPaymentTermCost(obj, () => { }))
            dispatch(isPaymentTermsDataChange(true))



        }
    }

    const handleChangeInterestRateFixedLimit = (event) => {
        let message = ''
        if (decimalAndNumberValidationBoolean(event.target.value)) {
            setInterestRateFixedLimit(true)
            message = MESSAGES.OTHER_VALIDATION_ERROR_MESSAGE
        } if (!isNumber(event.target.value)) {
            setInterestRateFixedLimit(true)
            message = NoSignNoDecimalMessage
        }
        setErrorMessage(message)
        dispatch(isOverheadProfitDataChange(true))
    }

    if (Object.keys(errors).length > 0 && counter < 2) {
        counter = counter + 1;
        dispatch(setOverheadProfitErrors(errors))
    } else if (Object.keys(errors).length === 0 && counter > 0) {
        counter = 0
        dispatch(setOverheadProfitErrors({}))
    }

    const handleCrmHeadChange = (e) => {
        if (e) {
            setTempPaymentTermObj({
                ...tempPaymentTermObj,
                PaymentTermCRMHead: e?.label
            })
        }
    }

    const handleChangeInterestRate = (isDataChange) => {
        props?.setPaymentTermsWarning(true)
        dispatch(isPaymentTermsDataChange(isDataChange))

    }
    const onRemarkPopUpClickPayment = () => {

        if (errors.paymentRemark !== undefined) {
            return false
        }

        setTempPaymentTermObj({
            ...tempPaymentTermObj,
            Remark: getValues('paymentRemark')
        })


        if (getValues(`paymentRemark`)) {
            Toaster.success('Remark saved successfully')
        }
        var button = document.getElementById(`popUpTriggerPayment`)
        button.click()
    }

    const onRemarkPopUpClosePayment = () => {
        let button = document.getElementById(`popUpTriggerPayment`)
        setValue(`paymentRemark`, tempPaymentTermObj?.Remark)
        if (errors.paymentRemark) {
            delete errors.paymentRemark;
        }
        button.click()
    }

    return (
        <>
            {props?.paymentTermsWarning && <WarningMessage message="Please save the payment term data before closing the accordion" />}
            {loader && <LoaderCustom />}
            {IsPaymentTermsApplicable &&
                <>
                    {initialConfiguration?.IsShowCRMHead && <Col md="3">
                        <SearchableSelectHookForm
                            name={`crmHeadPayment`}
                            type="text"
                            label="CRM Head"
                            errors={errors.crmHeadPayment}
                            Controller={Controller}
                            control={control}
                            register={register}
                            mandatory={false}
                            rules={{
                                required: false,
                            }}
                            placeholder={'Select'}
                            options={CRMHeads}
                            required={false}
                            handleChange={handleCrmHeadChange}
                            disabled={CostingViewMode}
                        />
                    </Col>}

                    <Row className='mb-4'>
                        <Col md="11" className='first-section'>
                            <Row className="costing-border-inner-section border-bottom-none m-0">
                                <Col md="3">
                                    <span className="head-text">
                                        Applicability
                                    </span>
                                </Col>
                                {paymentTermsApplicability.label !== 'Fixed' && <Col md="3">
                                    <span className="head-text">
                                        Repayment Period (No. of Days)
                                    </span>
                                </Col>}
                                <Col md="3">
                                    <span className="head-text">
                                        {paymentTermsApplicability.label !== 'Fixed' ? 'Interest Rate (%)' : 'Interest Rate'}
                                    </span>
                                </Col>
                                {/* <Col md={paymentTermsApplicability.label === 'Fixed' ? '6' : '3'}>
                                    <span className="head-text">
                                        Applicablity Cost
                                    </span>
                                </Col> */}

                                <Col md={paymentTermsApplicability.label === 'Fixed' ? '6' : '3'}>
                                    <span className="head-text">
                                        Cost
                                    </span>
                                </Col>
                            </Row>
                            <Row className="costing-border costing-border-with-labels px-2 pt-3 m-0 overhead-profit-tab-costing">
                                <>
                                    <Col md="3">
                                        <label className="col-label">
                                            {paymentTermsApplicability.label}
                                        </label>
                                    </Col>
                                    {paymentTermsApplicability.label !== 'Fixed' && <Col md="3">
                                        <TextFieldHookForm
                                            label={false}
                                            name={'RepaymentPeriodDays'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={false}
                                            handleChange={() => { dispatch(isOverheadProfitDataChange(true)) }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.RepaymentPeriodDays}
                                            disabled={paymentTermsApplicability.label !== 'Fixed' ? true : false}
                                        />
                                    </Col>}
                                    <Col md="3">
                                        {paymentTermsApplicability.label !== 'Fixed' ?
                                            <TextFieldHookForm
                                                label={false}
                                                name={'RepaymentPeriodPercentage'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                rules={{
                                                    required: false,
                                                    validate: { number, checkWhiteSpaces, percentageLimitValidation },
                                                    max: {
                                                        value: 100,
                                                        message: 'Percentage cannot be greater than 100'
                                                    },
                                                }}
                                                handleChange={() => { handleChangeInterestRate(true) }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.RepaymentPeriodPercentage}
                                                disabled={(CostingViewMode || paymentTermsApplicability.label === 'Fixed') ? true : false}
                                            />
                                            :
                                            <div className='p-relative error-wrapper'>
                                                <TextFieldHookForm
                                                    label={false}
                                                    name={'RepaymentPeriodFixed'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    // handleChange={() => { dispatch(isOverheadProfitDataChange(true)) }}
                                                    handleChange={(e) => {
                                                        handleChangeInterestRateFixedLimit(e);
                                                    }}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.RepaymentPeriodDays}
                                                    disabled={(paymentTermsApplicability.label !== 'Fixed' || CostingViewMode) ? true : false}
                                                />
                                                {paymentTermsApplicability.label === 'Fixed' && InterestRateFixedLimit && <WarningMessage dClass={"error-message fixed-error"} message={errorMessage} />}           {/* //MANUAL CSS FOR ERROR VALIDATION MESSAGE */}
                                            </div>}
                                    </Col>
                                    {/* <Col md={paymentTermsApplicability.label === 'Fixed' ? '6' : '3'}>
                                        <TextFieldHookForm
                                            label={false}
                                            name={'ApplicablityCost'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={false}
                                            handleChange={() => { }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.ApplicablityCost}
                                            disabled={true}
                                        />
                                    </Col> */}
                                    <Col md={paymentTermsApplicability.label === 'Fixed' ? '6' : '3'}>
                                        <TextFieldHookForm
                                            label={false}
                                            name={'RepaymentPeriodCost'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={false}
                                            handleChange={() => { }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.RepaymentPeriodCost}
                                            disabled={true}
                                        />
                                    </Col>
                                </>
                            </Row>
                        </Col>
                        <Col md="1" className='second-section pr-2'>
                            <div className='costing-border-inner-section'>
                                <Col md="12" className='text-center'>Remark</Col>
                                <Col md="12">
                                    <Popup trigger={<button id={`popUpTriggerPayment`} title="Remark" className="Comment-box" type={'button'} />}
                                        position="top center">
                                        <TextAreaHookForm
                                            label="Remark:"
                                            name={`paymentRemark`}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={false}
                                            rules={{
                                                maxLength: REMARKMAXLENGTH
                                            }}
                                            handleChange={() => { }}
                                            className=""
                                            customClassName={"withBorder"}
                                            errors={errors.paymentRemark}
                                            disabled={CostingViewMode}
                                            hidden={false}
                                            validateWithRemarkValidation={true}
                                        />
                                        <Row>
                                            <Col md="12" className='remark-btn-container'>
                                                <button className='submit-button mr-2' disabled={(CostingViewMode) ? true : false} onClick={() => onRemarkPopUpClickPayment()} > <div className='save-icon'></div> </button>
                                                <button className='reset' onClick={() => onRemarkPopUpClosePayment()} > <div className='cancel-icon'></div></button>
                                            </Col>
                                        </Row>
                                    </Popup>
                                </Col>
                            </div>
                        </Col>
                    </Row>


                </>
            }
        </>
    );
})

export default PaymentTerms;