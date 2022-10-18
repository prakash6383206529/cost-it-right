import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Row, } from 'reactstrap';
import { NumberFieldHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs';
// import { fetchModelTypeAPI, fetchCostingHeadsAPI, getICCAppliSelectListKeyValue, getPaymentTermsAppliSelectListKeyValue } from '../../../../../actions/Common';
import { calculatePercentage, checkForDecimalAndNull, checkForNull, getConfigurationKey } from '../../../../../helper';
import { getPaymentTermsDataByHeads, gridDataAdded, isOverheadProfitDataChange, } from '../../../actions/Costing';
import Switch from "react-switch";
import { CBCTypeId, EMPTY_GUID, VBCTypeId } from '../../../../../config/constants';
import { costingInfoContext, netHeadCostContext } from '../../CostingDetailStepTwo';
import { ViewCostingContext } from '../../CostingDetails';
import { IdForMultiTechnology } from '../../../../../config/masterData';

function PaymentTerms(props) {
    const { Controller, control, register, data, setValue, getValues, errors, useWatch, CostingInterestRateDetail, PaymentTermDetail } = props
    const headerCosts = useContext(netHeadCostContext);
    const CostingViewMode = useContext(ViewCostingContext);
    const costData = useContext(costingInfoContext);
    const initialConfiguration = useSelector(state => state.auth.initialConfiguration)

    const dispatch = useDispatch()

    const [IsPaymentTermsApplicable, setIsPaymentTermsApplicable] = useState(CostingInterestRateDetail && CostingInterestRateDetail.IsPaymentTerms ? true : false)
    const [paymentTermsApplicability, setPaymentTermsApplicability] = useState(PaymentTermDetail !== undefined ? { label: PaymentTermDetail.PaymentTermApplicability, value: PaymentTermDetail.PaymentTermApplicability } : [])
    const [PaymentTermInterestRateId, setPaymentTermInterestRateId] = useState(PaymentTermDetail !== undefined ? PaymentTermDetail.InterestRateId : '')
    const [tempPaymentTermObj, setTempPaymentTermObj] = useState(PaymentTermDetail)

    const PaymentTermsFieldValues = useWatch({
        control,
        name: ['RepaymentPeriodCost'],
    });

    const PaymentTermsFixedFieldValues = useWatch({
        control,
        name: ['RepaymentPeriodPercentage'],
    });

    useEffect(() => {

    }, [PaymentTermsFieldValues, PaymentTermsFixedFieldValues, paymentTermsApplicability]);

    useEffect(() => {
        setTimeout(() => {
            let tempObj = {
                "InterestRateId": paymentTermsApplicability.label !== 'Fixed' ? (IsPaymentTermsApplicable ? PaymentTermInterestRateId : '') : null,
                "PaymentTermDetailId": IsPaymentTermsApplicable ? PaymentTermDetail.IccDetailId : '',
                "PaymentTermApplicability": Object.keys(paymentTermsApplicability).length > 0 ? paymentTermsApplicability.label : '',
                "RepaymentPeriod": IsPaymentTermsApplicable ? getValues('RepaymentPeriodDays') : '',
                "InterestRate": IsPaymentTermsApplicable ? getValues('RepaymentPeriodPercentage') : '',
                "NetCost": IsPaymentTermsApplicable ? tempPaymentTermObj.NetCost : '',
                "EffectiveDate": ""
            }
            setValue('NetCost', IsPaymentTermsApplicable ? checkForDecimalAndNull(tempPaymentTermObj.NetCost, initialConfiguration.NoOfDecimalForPrice) : '')
            if (!CostingViewMode) {
                props.setPaymentTermsDetail(tempObj, { BOMLevel: data.BOMLevel, PartNumber: data.PartNumber })
            }
        }, 200)
    }, [tempPaymentTermObj, paymentTermsApplicability])


    /**
     * @method onPressPaymentTerms
     * @description  USED TO HANDLE INVENTORY CHANGE
     */
    const onPressPaymentTerms = (value) => {
        setIsPaymentTermsApplicable(!IsPaymentTermsApplicable)

        callPaymentTermAPI(value)

        dispatch(gridDataAdded(true))
        dispatch(isOverheadProfitDataChange(true))
    }

    /**
     * @method callPaymentTermAPI
     * @description ON TOGGLE OF PAYEMNT TERMS API CALL
    */

    const callPaymentTermAPI = (isCallAPI) => {
        if (Object.keys(costData).length > 0 && isCallAPI && !CostingViewMode) {

            const reqParams = {
                VendorId: costData?.CostingTypeId === VBCTypeId ? costData.VendorId : EMPTY_GUID,
                costingTypeId: costData.CostingTypeId,
                plantId: (getConfigurationKey()?.IsPlantRequiredForOverheadProfitInterestRate && costData?.CostingTypeId !== VBCTypeId) ? costData.PlantId : (getConfigurationKey()?.IsDestinationPlantConfigure && costData?.CostingTypeId === VBCTypeId) || (costData?.CostingTypeId === CBCTypeId) ? costData.DestinationPlantId : EMPTY_GUID,
                customerId: costData.CustomerId
            }

            dispatch(getPaymentTermsDataByHeads(reqParams, res => {

                if (res && res.data && res.data.Result) {
                    let Data = res.data.Data;
                    setValue('RepaymentPeriodDays', Data.RepaymentPeriod)
                    setValue('RepaymentPeriodPercentage', Data.InterestRate !== null ? Data.InterestRate : 0)
                    setPaymentTermInterestRateId(Data.InterestRateId !== EMPTY_GUID ? Data.InterestRateId : null)
                    checkPaymentTermApplicability(Data.PaymentTermApplicability)
                    setPaymentTermsApplicability({ label: Data.PaymentTermApplicability, value: Data.PaymentTermApplicability })
                } else if (res.status === 204) {
                    setValue('RepaymentPeriodDays', '')
                    setValue('RepaymentPeriodPercentage', '')
                    setValue('RepaymentPeriodCost', '')
                    checkPaymentTermApplicability('')
                    setPaymentTermsApplicability([])
                }

            }))

        } else {
            setPaymentTermsApplicability([])
            if (!CostingViewMode) {
                props.setPaymentTermsDetail(null, { BOMLevel: data.BOMLevel, PartNumber: data.PartNumber })
            }
        }
    }

    // useEffect(() => {
    //     if (IsPaymentTermsApplicable === true && Object.keys(costData).length >0) {

    //         const reqParams = {
    //             VendorId: costData.IsVendor ? costData.VendorId : EMPTY_GUID,
    //             IsVendor: costData.IsVendor
    //         }

    //         if(costData?.IsVendor && (costData.IsVendor !== null|| costData.IsVendor !== undefined)){
    //             dispatch(getPaymentTermsDataByHeads(reqParams, res => {

    //                 if (res && res.data && res.data.Result) {
    //                     let Data = res.data.Data;
    //                     setValue('RepaymentPeriodDays', Data.RepaymentPeriod)
    //                     setValue('RepaymentPeriodPercentage', Data.InterestRate !== null ? Data.InterestRate : 0)
    //                     setPaymentTermInterestRateId(Data.InterestRateId !== EMPTY_GUID ? Data.InterestRateId : null)
    //                     checkPaymentTermApplicability(Data.PaymentTermApplicability)
    //                     setPaymentTermsApplicability({ label: Data.PaymentTermApplicability, value: Data.PaymentTermApplicability })
    //                     setPaymentTermObj(Data)
    //                 } else if (res.status === 204) {
    //                     setValue('RepaymentPeriodDays', '')
    //                     setValue('RepaymentPeriodPercentage', '')
    //                     setValue('RepaymentPeriodCost', '')
    //                     checkPaymentTermApplicability('')
    //                     setPaymentTermsApplicability([])
    //                     setPaymentTermObj({})
    //                 }

    //             }))
    //         }

    //     } else {
    //         setPaymentTermsApplicability([])
    //         if (!CostingViewMode) {
    //             props.setPaymentTermsDetail(null, { BOMLevel: data.BOMLevel, PartNumber: data.PartNumber })
    //         }
    //     }
    // }, [IsPaymentTermsApplicable])


    // //USEEFFECT CALLED FOR FIXED VALUES SELECTED IN DROPDOWN
    useEffect(() => {
        if (paymentTermsApplicability && paymentTermsApplicability.label === 'Fixed') {
            setValue('RepaymentPeriodCost', getValues('RepaymentPeriodPercentage'))
        } else {
            checkPaymentTermApplicability(paymentTermsApplicability.label)
        }
    }, [PaymentTermsFixedFieldValues])

    /**
      * @method checkPaymentTermApplicability
      * @description PAYMENT TERMS APPLICABILITY CALCULATION
      */
    const checkPaymentTermApplicability = (Text) => {
        if (headerCosts !== undefined && Text !== '' && !CostingViewMode) {
            const ConversionCostForCalculation = costData.IsAssemblyPart ? checkForNull(headerCosts.NetConversionCost) - checkForNull(headerCosts.TotalOtherOperationCostPerAssembly) : headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal
            const RMBOPCC = headerCosts.NetRawMaterialsCost + headerCosts.NetBoughtOutPartCost + ConversionCostForCalculation
            const RMBOP = headerCosts.NetRawMaterialsCost + headerCosts.NetBoughtOutPartCost;
            const RMCC = headerCosts.NetRawMaterialsCost + ConversionCostForCalculation;
            const RepaymentPeriodDays = getValues('RepaymentPeriodDays')
            const RepaymentPeriodPercentage = getValues('RepaymentPeriodPercentage')
            const RepaymentCost = (calculatePercentage(RepaymentPeriodPercentage) / 90) * RepaymentPeriodDays;
            switch (Text) {
                case 'RM':
                    setValue('RepaymentPeriodCost', checkForDecimalAndNull((headerCosts.NetRawMaterialsCost * RepaymentCost), initialConfiguration.NoOfDecimalForPrice))
                    setTempPaymentTermObj({
                        ...tempPaymentTermObj,
                        NetCost: checkForNull(headerCosts?.NetRawMaterialsCost * RepaymentCost)
                    })
                    break;

                case 'RM + CC':
                    setValue('RepaymentPeriodCost', checkForDecimalAndNull((RMCC * RepaymentCost), initialConfiguration.NoOfDecimalForPrice))

                    setTempPaymentTermObj({
                        ...tempPaymentTermObj,
                        NetCost: checkForNull(RMCC * RepaymentCost)
                    })
                    break;

                case 'RM + BOP':
                    setValue('RepaymentPeriodCost', checkForDecimalAndNull((RMBOP * RepaymentCost), initialConfiguration.NoOfDecimalForPrice))

                    setTempPaymentTermObj({
                        ...tempPaymentTermObj,
                        NetCost: checkForNull(RMBOP * RepaymentCost)
                    })
                    break;

                case 'RM + CC + BOP':
                    setValue('RepaymentPeriodCost', checkForDecimalAndNull(((RMBOPCC) * RepaymentCost), initialConfiguration.NoOfDecimalForPrice))

                    setTempPaymentTermObj({
                        ...tempPaymentTermObj,
                        NetCost: checkForNull(RMBOPCC * RepaymentCost)
                    })
                    break;

                case 'Fixed':
                    setValue('RepaymentPeriodCost', checkForDecimalAndNull(RepaymentPeriodPercentage, initialConfiguration.NoOfDecimalForPrice))

                    setTempPaymentTermObj({
                        ...tempPaymentTermObj,
                        NetCost: checkForNull(RepaymentPeriodPercentage)
                    })
                    break;

                case 'Annual ICC (%)':
                    setValue('RepaymentPeriodCost', checkForDecimalAndNull((RMBOPCC * RepaymentCost), initialConfiguration.NoOfDecimalForPrice)) //NEED TO ASK HERE ALSO

                    setTempPaymentTermObj({
                        ...tempPaymentTermObj,
                        NetCost: checkForNull(RMBOPCC * RepaymentCost)
                    })
                    break;

                case 'Net Cost':
                    setValue('RepaymentPeriodCost', checkForDecimalAndNull((RMBOPCC * RepaymentCost), initialConfiguration.NoOfDecimalForPrice))

                    setTempPaymentTermObj({
                        ...tempPaymentTermObj,
                        NetCost: checkForNull(RMBOPCC * RepaymentCost)
                    })
                    break;

                default:
                    break;
            }

        }
    }

    return (
        <>
            <Row className="mt-15 pt-15">
                <Col md="12" className="switch mb-2">
                    <label className="switch-level">
                        <Switch
                            onChange={onPressPaymentTerms}
                            checked={IsPaymentTermsApplicable}
                            id="normal-switch"
                            disabled={CostingViewMode || (IdForMultiTechnology.includes(String(costData?.TechnologyId))) ? true : false}
                            background="#4DC771"
                            onColor="#4DC771"
                            onHandleColor="#ffffff"
                            offColor="#CCC"
                            uncheckedIcon={false}
                            checkedIcon={false}
                            height={20}
                            width={46}
                        />
                        <div className={'right-title'}>Payment Terms</div>
                    </label>
                </Col>
            </Row>
            {IsPaymentTermsApplicable &&
                <Row className="costing-border costing-border-with-labels px-2 py-3 m-0 overhead-profit-tab-costing mb-4">
                    <>
                        <Col md="3">
                            <label className="col-label">
                                {paymentTermsApplicability.label}
                            </label>
                        </Col>
                        {paymentTermsApplicability.label !== 'Fixed' && <Col md="3">
                            <TextFieldHookForm
                                label="Repayment Period(No. of Days)"
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
                                <NumberFieldHookForm
                                    label={`Interest Rate(%)`}
                                    name={'RepaymentPeriodPercentage'}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={false}
                                    rules={{
                                        required: false,
                                        pattern: {
                                            value: /^\d*\.?\d*$/,
                                            message: 'Invalid Number.'
                                        },
                                        max: {
                                            value: 100,
                                            message: 'Percentage cannot be greater than 100'
                                        },
                                    }}
                                    handleChange={() => { dispatch(isOverheadProfitDataChange(true)) }}
                                    defaultValue={''}
                                    className=""
                                    customClassName={'withBorder'}
                                    errors={errors.RepaymentPeriodPercentage}
                                    disabled={CostingViewMode ? true : false}
                                />
                                :
                                <NumberFieldHookForm
                                    label={`Interest Rate`}
                                    name={'RepaymentPeriodPercentage'}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={false}
                                    rules={{
                                        required: false,
                                        pattern: {
                                            value: /^\d*\.?\d*$/,
                                            message: 'Invalid Number.'
                                        },
                                    }}
                                    handleChange={() => { dispatch(isOverheadProfitDataChange(true)) }}
                                    defaultValue={''}
                                    className=""
                                    customClassName={'withBorder'}
                                    errors={errors.RepaymentPeriodPercentage}
                                    disabled={CostingViewMode || paymentTermsApplicability.label !== 'Fixed' ? true : false}
                                />}
                        </Col>
                        <Col md="3">
                            <TextFieldHookForm
                                label="Cost"
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
            }
        </>
    );
}

export default PaymentTerms;