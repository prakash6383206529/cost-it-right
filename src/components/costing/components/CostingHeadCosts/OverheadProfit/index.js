import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller, useWatch, } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Row, } from 'reactstrap';
import { SearchableSelectHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs';
import { CONSTANT } from '../../../../../helper/AllConastant';
import { toastr } from 'react-redux-toastr';
import { calculatePercentage, checkForDecimalAndNull, checkForNull } from '../../../../../helper';
import { fetchModelTypeAPI, fetchCostingHeadsAPI, getICCAppliSelectList, getPaymentTermsAppliSelectList } from '../../../../../actions/Common';
import { getOverheadProfitDataByModelType, getInventoryDataByHeads, getPaymentTermsDataByHeads, } from '../../../actions/Costing';
import Switch from "react-switch";
import { netHeadCostContext } from '../../CostingDetailStepTwo';

function OverheadProfit(props) {
  const { data } = props;
  const { CostingOverheadDetail, CostingProfitDetail, CostingRejectionDetail, CostingInterestRateDetail } = props.data.CostingPartDetails;

  const ICCApplicabilityDetail = CostingInterestRateDetail && CostingInterestRateDetail.ICCApplicabilityDetail !== null ? CostingInterestRateDetail.ICCApplicabilityDetail : {}
  const PaymentTermDetail = CostingInterestRateDetail && CostingInterestRateDetail.PaymentTermDetail !== null ? CostingInterestRateDetail.PaymentTermDetail : {}

  const defaultValues = {

    // //OVERHEAD FIXED FIELDS
    // OverheadFixedPercentage: CostingOverheadDetail && CostingOverheadDetail.IsOverheadFixedApplicable ? CostingOverheadDetail.OverheadFixedPercentage : '',
    // OverheadFixedCost: CostingOverheadDetail && CostingOverheadDetail.IsOverheadFixedApplicable ? CostingOverheadDetail.OverheadFixedCost : '',
    // OverheadFixedTotalCost: CostingOverheadDetail && CostingOverheadDetail.IsOverheadFixedApplicable ? CostingOverheadDetail.OverheadFixedTotalCost : '',

    // //OVERHEAD COMBINED FIELDS
    // OverheadPercentage: CostingOverheadDetail && CostingOverheadDetail.IsOverheadCombined ? CostingOverheadDetail.OverheadPercentage : '',
    // OverheadCombinedCost: CostingOverheadDetail && CostingOverheadDetail.IsOverheadCombined ? CostingOverheadDetail.OverheadCombinedCost : '',
    // OverheadCombinedTotalCost: CostingOverheadDetail && CostingOverheadDetail.IsOverheadCombined ? CostingOverheadDetail.OverheadCombinedTotalCost : '',

    // //OVERHEAD RM 
    //OverheadRMPercentage: CostingOverheadDetail && CostingOverheadDetail.IsOverheadRMApplicable ? CostingOverheadDetail.OverheadRMPercentage : '',
    //OverheadRMCost: CostingOverheadDetail && CostingOverheadDetail.IsOverheadRMApplicable ? CostingOverheadDetail.OverheadRMCost : '',
    //OverheadRMTotalCost: CostingOverheadDetail && CostingOverheadDetail.IsOverheadRMApplicable ? CostingOverheadDetail.OverheadRMTotalCost : '',


    // //OVERHEAD CC
    // OverheadCCPercentage: CostingOverheadDetail && CostingOverheadDetail.IsOverheadCCApplicable ? CostingOverheadDetail.OverheadCCPercentage : '',
    // OverheadCCCost: CostingOverheadDetail && CostingOverheadDetail.IsOverheadCCApplicable ? CostingOverheadDetail.OverheadCCCost : '',
    // OverheadCCTotalCost: CostingOverheadDetail && CostingOverheadDetail.IsOverheadCCApplicable ? CostingOverheadDetail.OverheadCCTotalCost : '',


    // //OVERHEAD BOP
    // OverheadBOPPercentage: CostingOverheadDetail && CostingOverheadDetail.IsOverheadBOPApplicable ? CostingOverheadDetail.OverheadBOPPercentage : '',
    // OverheadBOPCost: CostingOverheadDetail && CostingOverheadDetail.IsOverheadBOPApplicable ? CostingOverheadDetail.OverheadBOPCost : '',
    // OverheadBOPTotalCost: CostingOverheadDetail && CostingOverheadDetail.IsOverheadBOPApplicable ? CostingOverheadDetail.OverheadBOPTotalCost : '',

    //PROFIT FIXED FIELDS

    //PROFIT COMBINED FIELDS

    //PROFIT RM 

    //PROFIT CC

    //PROFIT BOP

    //REJECTION FIELDS
    Applicability: CostingRejectionDetail && CostingRejectionDetail.RejectionApplicability !== null ? { label: CostingRejectionDetail.RejectionApplicability, value: CostingRejectionDetail.RejectionApplicabilityId } : '',
    RejectionPercentage: CostingRejectionDetail && CostingRejectionDetail.RejectionPercentage !== null ? CostingRejectionDetail.RejectionPercentage : '',
    RejectionCost: CostingRejectionDetail && CostingRejectionDetail.RejectionCost !== null ? CostingRejectionDetail.RejectionCost : '',
    RejectionTotalCost: CostingRejectionDetail && CostingRejectionDetail.RejectionTotalCost !== null ? CostingRejectionDetail.RejectionTotalCost : '',

    // ICC FIELDS
    ICCApplicability: ICCApplicabilityDetail !== null ? ICCApplicabilityDetail.ICCApplicability : '',
    InterestRatePercentage: ICCApplicabilityDetail !== null ? ICCApplicabilityDetail.InterestRate : '',
    InterestRateCost: ICCApplicabilityDetail !== null ? ICCApplicabilityDetail.CostApplicability : '',
    NetICCTotal: ICCApplicabilityDetail !== null ? ICCApplicabilityDetail.NetCost : '',

    //PAYMENT TERMS FIELDS
    PaymentTermsApplicability: PaymentTermDetail !== null ? PaymentTermDetail.PaymentTermApplicability : '',
    RepaymentPeriodDays: PaymentTermDetail !== null ? PaymentTermDetail.RepaymentPeriod : '',
    RepaymentPeriodPercentage: PaymentTermDetail !== null ? PaymentTermDetail.InterestRate : '',
    RepaymentPeriodCost: PaymentTermDetail !== null ? PaymentTermDetail.NetCost : '',
  }

  const { register, handleSubmit, control, setValue, getValues, reset, errors } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: defaultValues,
  });

  const dispatch = useDispatch()
  const headerCosts = useContext(netHeadCostContext);
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)

  const [dataObj, setDataObj] = useState({})
  const [overheadObj, setOverheadObj] = useState(CostingOverheadDetail)
  const [profitObj, setProfitObj] = useState(CostingProfitDetail)
  const [rejectionObj, setRejectionObj] = useState(CostingRejectionDetail)
  const [InventoryObj, setInventoryObj] = useState(ICCApplicabilityDetail)
  const [PaymentTermObj, setPaymentTermObj] = useState(PaymentTermDetail)

  const [modelType, setModelType] = useState(data.CostingPartDetails && data.CostingPartDetails.ModelType !== null ? { label: data.CostingPartDetails.ModelType, value: data.CostingPartDetails.ModelTypeId } : [])

  const [applicability, setApplicability] = useState(CostingRejectionDetail && CostingRejectionDetail.RejectionApplicability !== null ? { label: CostingRejectionDetail.RejectionApplicability, value: CostingRejectionDetail.RejectionApplicabilityId } : [])

  const [IsInventoryApplicable, setIsInventoryApplicable] = useState(CostingInterestRateDetail && CostingInterestRateDetail.IsInventoryCarringCost !== null ? true : false)
  const [ICCapplicability, setICCapplicability] = useState(ICCApplicabilityDetail !== undefined ? { label: ICCApplicabilityDetail.ICCApplicability, value: ICCApplicabilityDetail.ICCApplicability } : [])
  const [ICCInterestRateId, setICCInterestRateId] = useState(ICCApplicabilityDetail !== undefined ? ICCApplicabilityDetail.InterestRateId : '')

  const [IsPaymentTermsApplicable, setIsPaymentTermsApplicable] = useState(CostingInterestRateDetail && CostingInterestRateDetail.IsPaymentTerms !== null ? true : false)
  const [paymentTermsApplicability, setPaymentTermsApplicability] = useState(PaymentTermDetail !== undefined ? { label: PaymentTermDetail.PaymentTermApplicability, value: PaymentTermDetail.PaymentTermApplicability } : [])
  const [PaymentTermInterestRateId, setPaymentTermInterestRateId] = useState(PaymentTermDetail !== undefined ? PaymentTermDetail.InterestRateId : '')

  setValue('ICCApplicability', ICCApplicabilityDetail !== undefined ? { label: ICCApplicabilityDetail.ICCApplicability, value: ICCApplicabilityDetail.ICCApplicability } : [])
  setValue('PaymentTermsApplicability', PaymentTermDetail !== undefined ? { label: PaymentTermDetail.PaymentTermApplicability, value: PaymentTermDetail.PaymentTermApplicability } : [])

  //INITIAL CALLED EFFECT TO SET VALUES
  useEffect(() => {
    checkIsOverheadCombined()
    checkIsOverheadRMApplicable()
    checkIsOverheadBOPApplicable()
    checkIsOverheadCCApplicable()

    checkIsProfitCombined()
    checkIsProfitRMApplicable()
    checkIsProfitBOPApplicable()
    checkIsProfitCCApplicable()

    if (data.CostingPartDetails && data.CostingPartDetails.ModelTypeId !== null) {
      handleModelTypeChange({ label: data.CostingPartDetails.ModelType, value: data.CostingPartDetails.ModelTypeId })
    }

    if (ICCApplicabilityDetail !== undefined) {
      setICCapplicability({ label: ICCApplicabilityDetail.ICCApplicability, value: ICCApplicabilityDetail.ICCApplicability })
      setICCInterestRateId(ICCApplicabilityDetail.InterestRateId)
    }

    if (PaymentTermDetail !== undefined) {
      setPaymentTermsApplicability({ label: PaymentTermDetail.PaymentTermApplicability, value: PaymentTermDetail.PaymentTermApplicability })
      setPaymentTermInterestRateId(PaymentTermDetail.InterestRateId)
    }

  }, []);

  const overheadFieldValues = useWatch({
    control,
    name: ['OverheadFixedPercentage',],
  });

  useEffect(() => {
    setTimeout(() => {
      let tempObj = {
        "OverheadId": overheadObj.OverheadId,
        "OverheadApplicabilityId": overheadObj.OverheadApplicabilityId,
        "OverheadApplicability": overheadObj.OverheadApplicability,

        "IsOverheadCombined": overheadObj.IsOverheadCombined,
        "OverheadPercentage": overheadObj.IsOverheadCombined ? getValues('OverheadPercentage') : '',
        "OverheadCombinedCost": overheadObj.IsOverheadCombined ? getValues('OverheadCombinedCost') : '',
        "OverheadCombinedTotalCost": overheadObj.IsOverheadCombined ? getValues('OverheadCombinedTotalCost') : '',

        "IsOverheadCCApplicable": overheadObj.IsOverheadCCApplicable,
        "OverheadCCPercentage": overheadObj.IsOverheadCCApplicable ? getValues('OverheadCCPercentage') : '',
        "OverheadCCCost": overheadObj.IsOverheadCCApplicable ? getValues('OverheadCCCost') : '',
        "OverheadCCTotalCost": overheadObj.IsOverheadCCApplicable ? getValues('OverheadCCTotalCost') : '',

        "IsOverheadBOPApplicable": overheadObj.IsOverheadBOPApplicable,
        "OverheadBOPPercentage": overheadObj.IsOverheadBOPApplicable ? getValues('OverheadBOPPercentage') : '',
        "OverheadBOPCost": overheadObj.IsOverheadBOPApplicable ? getValues('OverheadBOPCost') : '',
        "OverheadBOPTotalCost": overheadObj.IsOverheadBOPApplicable ? getValues('OverheadBOPTotalCost') : '',

        "IsOverheadRMApplicable": overheadObj.IsOverheadRMApplicable,
        "OverheadRMPercentage": overheadObj.IsOverheadRMApplicable ? getValues('OverheadRMPercentage') : '',
        "OverheadRMCost": overheadObj.IsOverheadRMApplicable ? getValues('OverheadRMCost') : '',
        "OverheadRMTotalCost": overheadObj.IsOverheadRMApplicable ? getValues('OverheadRMTotalCost') : '',

        "IsOverheadFixedApplicable": overheadObj.IsOverheadFixedApplicable,
        "OverheadFixedPercentage": overheadObj.IsOverheadFixedApplicable ? getValues('OverheadFixedPercentage') : '',
        "OverheadFixedCost": overheadObj.IsOverheadFixedApplicable ? getValues('OverheadFixedCost') : '',
        "OverheadFixedTotalCost": overheadObj.IsOverheadFixedApplicable ? getValues('OverheadFixedTotalCost') : '',

        "IsSurfaceTreatmentApplicable": true
      }

      let profitTempObj = {
        "ProfitId": profitObj.ProfitId,
        "ProfitApplicabilityId": profitObj.ProfitApplicabilityId,
        "ProfitApplicability": profitObj.ProfitApplicability,

        "IsProfitCombined": profitObj.IsProfitCombined,
        "ProfitPercentage": profitObj.IsProfitCombined ? getValues('ProfitPercentage') : '',
        "ProfitCombinedCost": profitObj.IsProfitCombined ? getValues('ProfitCombinedCost') : '',
        "ProfitCombinedTotalCost": profitObj.IsProfitCombined ? getValues('ProfitCombinedTotalCost') : '',

        "IsProfitCCApplicable": profitObj.IsProfitCCApplicable,
        "ProfitCCPercentage": profitObj.IsProfitCCApplicable ? getValues('ProfitCCPercentage') : '',
        "ProfitCCCost": profitObj.IsProfitCCApplicable ? getValues('ProfitCCCost') : '',
        "ProfitCCTotalCost": profitObj.IsProfitCCApplicable ? getValues('ProfitCCTotalCost') : '',

        "IsProfitBOPApplicable": profitObj.IsProfitBOPApplicable,
        "ProfitBOPPercentage": profitObj.IsProfitBOPApplicable ? getValues('ProfitBOPPercentage') : '',
        "ProfitBOPCost": profitObj.IsProfitBOPApplicable ? getValues('ProfitBOPCost') : '',
        "ProfitBOPTotalCost": profitObj.IsProfitBOPApplicable ? getValues('ProfitBOPTotalCost') : '',

        "IsProfitRMApplicable": profitObj.IsProfitRMApplicable,
        "ProfitRMPercentage": profitObj.IsProfitRMApplicable ? getValues('ProfitRMPercentage') : '',
        "ProfitRMCost": profitObj.IsProfitRMApplicable ? getValues('ProfitRMCost') : '',
        "ProfitRMTotalCost": profitObj.IsProfitRMApplicable ? getValues('ProfitRMTotalCost') : '',

        "IsProfitFixedApplicable": profitObj.IsProfitFixedApplicable,
        "ProfitFixedPercentage": profitObj.IsProfitFixedApplicable ? getValues('ProfitFixedPercentage') : '',
        "ProfitFixedCost": profitObj.IsProfitFixedApplicable ? getValues('ProfitFixedCost') : '',
        "ProfitFixedTotalCost": profitObj.IsProfitFixedApplicable ? getValues('ProfitFixedTotalCost') : '',

        "IsSurfaceTreatmentApplicable": true
      }

      props.setOverheadDetail({ overheadObj: tempObj, profitObj: profitTempObj, modelType: modelType }, { BOMLevel: data.BOMLevel, PartNumber: data.PartNumber })
    }, 500)

  }, [overheadObj, profitObj]);

  const profitFieldValues = useWatch({
    control,
    name: ['ProfitFixedPercentage',],
  });

  const rejectionFieldValues = useWatch({
    control,
    name: ['RejectionPercentage', 'Applicability'],
  });

  useEffect(() => {
    checkRejectionApplicability(applicability.label)
    let tempObj = {
      "RejectionApplicabilityId": applicability ? applicability.value : '',
      "RejectionApplicability": applicability ? applicability.label : '',
      "RejectionPercentage": applicability ? getValues('RejectionPercentage') : '',
      "RejectionCost": applicability ? getValues('RejectionCost') : '',
      "RejectionTotalCost": applicability ? getValues('RejectionTotalCost') : '',
      "IsSurfaceTreatmentApplicable": true,
    }

    setTimeout(() => {
      props.setRejectionDetail(tempObj, { BOMLevel: data.BOMLevel, PartNumber: data.PartNumber })
    }, 200)
  }, [rejectionFieldValues]);

  const ICCFieldValues = useWatch({
    control,
    name: ['NetICCTotal'],
  });

  useEffect(() => {
    let tempObj = {
      "InterestRateId": ICCApplicabilityDetail ? ICCInterestRateId : '',
      "IccDetailId": ICCApplicabilityDetail ? ICCApplicabilityDetail.IccDetailId : '',
      "ICCApplicability": IsInventoryApplicable ? ICCapplicability.label : '',
      "CostApplicability": IsInventoryApplicable ? getValues('InterestRateCost') : '',
      "InterestRate": IsInventoryApplicable ? getValues('InterestRatePercentage') : '',
      "NetCost": IsInventoryApplicable ? getValues('NetICCTotal') : '',
      "EffectiveDate": "",
    }

    setTimeout(() => {
      props.setICCDetail(tempObj, { BOMLevel: data.BOMLevel, PartNumber: data.PartNumber })
    }, 500)
  }, [ICCFieldValues]);

  const PaymentTermsFieldValues = useWatch({
    control,
    name: ['RepaymentPeriodCost'],
  });

  useEffect(() => {
    let tempObj = {
      "InterestRateId": IsPaymentTermsApplicable ? PaymentTermInterestRateId : '',
      "PaymentTermDetailId": IsPaymentTermsApplicable ? PaymentTermDetail.IccDetailId : '',
      "PaymentTermApplicability": IsPaymentTermsApplicable ? paymentTermsApplicability.label : '',
      "RepaymentPeriod": IsPaymentTermsApplicable ? getValues('RepaymentPeriodDays') : '',
      "InterestRate": IsPaymentTermsApplicable ? getValues('RepaymentPeriodPercentage') : '',
      "NetCost": IsPaymentTermsApplicable ? getValues('RepaymentPeriodCost') : '',
      "EffectiveDate": ""
    }

    setTimeout(() => {
      props.setPaymentTermsDetail(tempObj, { BOMLevel: data.BOMLevel, PartNumber: data.PartNumber })
    }, 500)
  }, [PaymentTermsFieldValues]);

  useEffect(() => {
    dispatch(fetchModelTypeAPI('--Model Types--', (res) => { }))
    dispatch(fetchCostingHeadsAPI('--Costing Heads--', (res) => { }))
    dispatch(getICCAppliSelectList((res) => { }))
    dispatch(getPaymentTermsAppliSelectList((res) => { }))
  }, []);


  //EFFECT CALLED WHEN OVERHEAD OR PROFIT VALUES CHANGED
  useEffect(() => {
    calculateOverheadFixedTotalCost()
    calculateProfitFixedTotalCost()
  }, [overheadFieldValues, profitFieldValues]);

  const modelTypes = useSelector(state => state.comman.modelTypes)
  const costingHead = useSelector(state => state.comman.costingHead)
  const iccApplicabilitySelectList = useSelector(state => state.comman.iccApplicabilitySelectList)
  const paymentTermsSelectList = useSelector(state => state.comman.paymentTermsSelectList)

  /**
  * @method calculateOverheadFixedTotalCost
  * @description CALCULATE OVERHEAD FIXED TOTAL COST
  */
  const calculateOverheadFixedTotalCost = () => {
    const { IsOverheadFixedApplicable } = overheadObj;
    if (headerCosts !== undefined && IsOverheadFixedApplicable) {

      const { NetTotalRMBOPCC } = props.headerCosts;
      const { OverheadFixedPercentage } = overheadFieldValues;

      setValue('OverheadFixedCost', NetTotalRMBOPCC)
      setValue('OverheadFixedTotalCost', checkForDecimalAndNull(NetTotalRMBOPCC * calculatePercentage(OverheadFixedPercentage), 2))
    }
  }

  /**
  * @method checkIsOverheadCombined
  * @description OVERHEAD COMBINED CALCULATION
  */
  const checkIsOverheadCombined = () => {
    const { IsOverheadCombined } = overheadObj;
    if (headerCosts !== undefined && IsOverheadCombined) {
      const OverheadCombinedText = 'RM + CC + BOP';
      calculateOverheadCombinedCost(OverheadCombinedText)
    }
  }

  /**
   * @method calculateOverheadCombinedCost
   * @description OVERHEAD COMBINED CALCULATION
   */
  const calculateOverheadCombinedCost = (OverheadCombinedText) => {
    const { OverheadPercentage } = overheadObj;

    switch (OverheadCombinedText) {
      case 'RM + BOP + CC':
        setValue('OverheadPercentage', OverheadPercentage)
        setValue('OverheadCombinedCost', headerCosts.NetTotalRMBOPCC)
        setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * calculatePercentage(OverheadPercentage), 2))
        break;

      case 'RM + BOP':
        const RMBOP = headerCosts.NetRawMaterialsCost + headerCosts.NetBoughtOutPartCost;
        setValue('OverheadPercentage', OverheadPercentage)
        setValue('OverheadCombinedCost', RMBOP)
        setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(RMBOP * calculatePercentage(OverheadPercentage), 2))
        break;

      case 'RM + CC':
        const RMCC = headerCosts.NetRawMaterialsCost + headerCosts.NetConversionCost;
        setValue('OverheadPercentage', OverheadPercentage)
        setValue('OverheadCombinedCost', RMCC)
        setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(RMCC * calculatePercentage(OverheadPercentage), 2))
        break;

      case 'BOP + CC':
        const BOPCC = headerCosts.NetBoughtOutPartCost + headerCosts.NetConversionCost;
        setValue('OverheadPercentage', OverheadPercentage)
        setValue('OverheadCombinedCost', BOPCC)
        setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(BOPCC * calculatePercentage(OverheadPercentage), 2))
        break;

      default:
        break;
    }
  }

  /**
  * @method checkIsOverheadRMApplicable
  * @description OVERHEAD RM APPLICABILITY CALCULATION
  */
  const checkIsOverheadRMApplicable = () => {
    const { IsOverheadRMApplicable, OverheadRMPercentage } = overheadObj;
    if (headerCosts !== undefined && IsOverheadRMApplicable) {
      setValue('OverheadRMPercentage', OverheadRMPercentage)
      setValue('OverheadRMCost', headerCosts.NetRawMaterialsCost)
      setValue('OverheadRMTotalCost', checkForDecimalAndNull(headerCosts.NetRawMaterialsCost * calculatePercentage(OverheadRMPercentage), 2))
    }
  }

  /**
  * @method checkIsOverheadBOPApplicable
  * @description OVERHEAD BOP APPLICABILITY CALCULATION
  */
  const checkIsOverheadBOPApplicable = () => {
    const { IsProfitBOPApplicable, ProfitBOPPercentage } = overheadObj;
    if (headerCosts !== undefined && IsProfitBOPApplicable) {
      setValue('ProfitBOPPercentage', ProfitBOPPercentage)
      setValue('ProfitBOPCost', headerCosts.NetBoughtOutPartCost)
      setValue('ProfitBOPTotalCost', checkForDecimalAndNull(headerCosts.NetBoughtOutPartCost * calculatePercentage(ProfitBOPPercentage), 2))
    }
  }

  /**
  * @method checkIsOverheadCCApplicable
  * @description OVERHEAD CC APPLICABILITY CALCULATION
  */
  const checkIsOverheadCCApplicable = () => {
    const { IsOverheadCCApplicable, OverheadCCPercentage } = overheadObj;
    if (headerCosts !== undefined && IsOverheadCCApplicable) {
      setValue('OverheadCCPercentage', OverheadCCPercentage)
      setValue('OverheadCCCost', headerCosts.NetConversionCost)
      setValue('OverheadCCTotalCost', checkForDecimalAndNull(headerCosts.NetConversionCost * calculatePercentage(OverheadCCPercentage), 2))
    }
  }

  /**
  * @method calculateProfitFixedTotalCost
  * @description CALCULATE PROFIT FIXED TOTAL COST
  */
  const calculateProfitFixedTotalCost = () => {
    const { IsProfitFixedApplicable } = profitObj;
    if (headerCosts !== undefined && IsProfitFixedApplicable) {

      const { ProfitFixedPercentage } = profitFieldValues;

      setValue('ProfitFixedCost', headerCosts.NetTotalRMBOPCC)
      setValue('ProfitFixedTotalCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * calculatePercentage(ProfitFixedPercentage), 2))
    }
  }

  /**
  * @method checkIsProfitCombined
  * @description PROFIT COMBINED CALCULATION
  */
  const checkIsProfitCombined = () => {
    const { IsProfitCombined } = profitObj;
    if (headerCosts !== undefined && IsProfitCombined) {
      const ProfitCombinedText = 'RM + CC + BOP';
      calculateProfitCombinedCost(ProfitCombinedText)
    }
  }

  /**
   * @method calculateProfitCombinedCost
   * @description PROFIT COMBINED CALCULATION
   */
  const calculateProfitCombinedCost = (ProfitCombinedText) => {
    const { ProfitPercentage } = profitObj;

    switch (ProfitCombinedText) {
      case 'RM + BOP + CC':
        setValue('ProfitPercentage', ProfitPercentage)
        setValue('ProfitCombinedCost', headerCosts.NetTotalRMBOPCC)
        setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * calculatePercentage(ProfitPercentage), 2))
        break;

      case 'RM + BOP':
        const RMBOP = headerCosts.NetRawMaterialsCost + headerCosts.NetBoughtOutPartCost;
        setValue('ProfitPercentage', ProfitPercentage)
        setValue('ProfitCombinedCost', RMBOP)
        setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(RMBOP * calculatePercentage(ProfitPercentage), 2))
        break;

      case 'RM + CC':
        const RMCC = headerCosts.NetRawMaterialsCost + headerCosts.NetConversionCost;
        setValue('ProfitPercentage', ProfitPercentage)
        setValue('ProfitCombinedCost', RMCC)
        setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(RMCC * calculatePercentage(ProfitPercentage), 2))
        break;

      case 'BOP + CC':
        const BOPCC = headerCosts.NetBoughtOutPartCost + headerCosts.NetConversionCost;
        setValue('ProfitPercentage', ProfitPercentage)
        setValue('ProfitCombinedCost', BOPCC)
        setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(BOPCC * calculatePercentage(ProfitPercentage), 2))
        break;

      default:
        break;
    }
  }

  /**
  * @method checkIsProfitRMApplicable
  * @description PROFIT RM APPLICABILITY CALCULATION
  */
  const checkIsProfitRMApplicable = () => {
    const { IsProfitRMApplicable, ProfitRMPercentage } = profitObj;
    if (headerCosts !== undefined && IsProfitRMApplicable) {
      setValue('ProfitRMPercentage', ProfitRMPercentage)
      setValue('ProfitRMCost', headerCosts.NetRawMaterialsCost)
      setValue('ProfitRMTotalCost', checkForDecimalAndNull(headerCosts.NetRawMaterialsCost * calculatePercentage(ProfitRMPercentage), 2))
    }
  }

  /**
    * @method checkIsProfitBOPApplicable
    * @description PROFIT BOP APPLICABILITY CALCULATION
    */
  const checkIsProfitBOPApplicable = () => {
    const { IsOverheadBOPApplicable, OverheadBOPPercentage } = profitObj;
    if (headerCosts !== undefined && IsOverheadBOPApplicable) {
      setValue('OverheadBOPPercentage', OverheadBOPPercentage)
      setValue('OverheadBOPCost', headerCosts.NetBoughtOutPartCost)
      setValue('OverheadBOPTotalCost', checkForDecimalAndNull(headerCosts.NetBoughtOutPartCost * calculatePercentage(OverheadBOPPercentage), 2))
    }
  }

  /**
    * @method checkIsProfitCCApplicable
    * @description PROFIT CC APPLICABILITY CALCULATION
    */
  const checkIsProfitCCApplicable = () => {
    const { IsProfitCCApplicable, ProfitCCPercentage } = profitObj;
    if (headerCosts !== undefined && IsProfitCCApplicable) {
      setValue('ProfitCCPercentage', ProfitCCPercentage)
      setValue('ProfitCCCost', headerCosts.NetConversionCost)
      setValue('ProfitCCTotalCost', checkForDecimalAndNull(headerCosts.NetConversionCost * calculatePercentage(ProfitCCPercentage), 2))
    }
  }

  /**
    * @method checkRejectionApplicability
    * @description REJECTION APPLICABILITY CALCULATION
    */
  const checkRejectionApplicability = (Text) => {
    const { RejectionApplicability, RejectionPercentage } = rejectionObj;
    if (headerCosts && Text !== '') {

      const RMBOP = headerCosts.NetRawMaterialsCost + headerCosts.NetBoughtOutPartCost;
      const RMCC = headerCosts.NetRawMaterialsCost + headerCosts.NetConversionCost;
      const BOPCC = headerCosts.NetBoughtOutPartCost + headerCosts.NetConversionCost;
      const RejectionPercentage = getValues('RejectionPercentage')

      switch (Text) {
        case 'RM':
          //setValue('RejectionPercentage', RejectionPercentage)
          setValue('RejectionCost', headerCosts.NetRawMaterialsCost)
          setValue('RejectionTotalCost', checkForDecimalAndNull(headerCosts.NetRawMaterialsCost * calculatePercentage(RejectionPercentage), 2))
          setRejectionObj({
            ...rejectionObj,
            RejectionApplicabilityId: applicability.value,
            RejectionApplicability: applicability.label,
            RejectionPercentage: RejectionPercentage,
            RejectionCost: headerCosts.NetRawMaterialsCost,
            RejectionTotalCost: getValues('RejectionTotalCost')
          })
          break;

        case 'BOP':
          //setValue('RejectionPercentage', RejectionPercentage)
          setValue('RejectionCost', headerCosts.NetBoughtOutPartCost)
          setValue('RejectionTotalCost', checkForDecimalAndNull(headerCosts.NetBoughtOutPartCost * calculatePercentage(RejectionPercentage), 2))
          setRejectionObj({
            ...rejectionObj,
            RejectionApplicabilityId: applicability.value,
            RejectionApplicability: applicability.label,
            RejectionPercentage: RejectionPercentage,
            RejectionCost: headerCosts.NetBoughtOutPartCost,
            RejectionTotalCost: getValues('RejectionTotalCost')
          })
          break;

        case 'CC':
          //setValue('RejectionPercentage', RejectionPercentage)
          setValue('RejectionCost', headerCosts.NetConversionCost)
          setValue('RejectionTotalCost', checkForDecimalAndNull(headerCosts.NetConversionCost * calculatePercentage(RejectionPercentage), 2))
          setRejectionObj({
            ...rejectionObj,
            RejectionApplicabilityId: applicability.value,
            RejectionApplicability: applicability.label,
            RejectionPercentage: RejectionPercentage,
            RejectionCost: headerCosts.NetConversionCost,
            RejectionTotalCost: getValues('RejectionTotalCost')
          })
          break;

        case 'RM + BOP + CC':
          //setValue('RejectionPercentage', RejectionPercentage)
          setValue('RejectionCost', headerCosts.NetTotalRMBOPCC)
          setValue('RejectionTotalCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * calculatePercentage(RejectionPercentage), 2))
          setRejectionObj({
            ...rejectionObj,
            RejectionApplicabilityId: applicability.value,
            RejectionApplicability: applicability.label,
            RejectionPercentage: RejectionPercentage,
            RejectionCost: headerCosts.NetTotalRMBOPCC,
            RejectionTotalCost: getValues('RejectionTotalCost')
          })
          break;

        case 'RM + BOP':
          //setValue('RejectionPercentage', RejectionPercentage)
          setValue('RejectionCost', RMBOP)
          setValue('RejectionTotalCost', checkForDecimalAndNull(RMBOP * calculatePercentage(RejectionPercentage), 2))
          setRejectionObj({
            ...rejectionObj,
            RejectionApplicabilityId: applicability.value,
            RejectionApplicability: applicability.label,
            RejectionPercentage: RejectionPercentage,
            RejectionCost: RMBOP,
            RejectionTotalCost: getValues('RejectionTotalCost')
          })
          break;

        case 'RM + CC':
          //setValue('RejectionPercentage', RejectionPercentage)
          setValue('RejectionCost', RMCC)
          setValue('RejectionTotalCost', checkForDecimalAndNull(RMCC * calculatePercentage(RejectionPercentage), 2))
          setRejectionObj({
            ...rejectionObj,
            RejectionApplicabilityId: applicability.value,
            RejectionApplicability: applicability.label,
            RejectionPercentage: RejectionPercentage,
            RejectionCost: RMCC,
            RejectionTotalCost: getValues('RejectionTotalCost')
          })
          break;

        case 'BOP + CC':
          //setValue('RejectionPercentage', RejectionPercentage)
          setValue('RejectionCost', BOPCC)
          setValue('RejectionTotalCost', checkForDecimalAndNull(BOPCC * calculatePercentage(RejectionPercentage), 2))
          setRejectionObj({
            ...rejectionObj,
            RejectionApplicabilityId: applicability.value,
            RejectionApplicability: applicability.label,
            RejectionPercentage: RejectionPercentage,
            RejectionCost: BOPCC,
            RejectionTotalCost: getValues('RejectionTotalCost')
          })
          break;

        case 'Fixed':
          //setValue('RejectionPercentage', RejectionPercentage)
          setValue('RejectionCost', headerCosts.NetTotalRMBOPCC)
          setValue('RejectionTotalCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * calculatePercentage(RejectionPercentage), 2))
          setRejectionObj({
            ...rejectionObj,
            RejectionApplicabilityId: applicability.value,
            RejectionApplicability: applicability.label,
            RejectionPercentage: RejectionPercentage,
            RejectionCost: headerCosts.NetTotalRMBOPCC,
            RejectionTotalCost: getValues('RejectionTotalCost')
          })
          break;

        default:
          break;
      }
    }
  }



  /**
  * @method renderListing
  * @description RENDER LISTING
  */
  const renderListing = (label) => {

    const temp = [];

    if (label === 'ModelType') {
      modelTypes && modelTypes.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }

    if (label === 'Applicability') {
      costingHead && costingHead.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }

    if (label === 'ICCApplicability') {
      iccApplicabilitySelectList && iccApplicabilitySelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }

    if (label === 'PaymentTermsApplicability') {
      paymentTermsSelectList && paymentTermsSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }

  }

  /**
    * @method handleModelTypeChange
    * @description  USED TO HANDLE MODEL TYPE CHANGE
    */
  const handleModelTypeChange = (newValue) => {
    if (newValue && newValue !== '') {
      setModelType(newValue)
      dispatch(getOverheadProfitDataByModelType(newValue.value, res => {
        if (res && res.data && res.data.Data) {
          let Data = res.data.Data;
          setOverheadObj(Data.CostingOverheadDetail)
          setProfitObj(Data.CostingProfitDetail)

          //props.setOverheadDetail(Data.CostingOverheadDetail, props.index)
          if (Data.CostingOverheadDetail) {
            setTimeout(() => {
              setOverheadValues(Data.CostingOverheadDetail)
            }, 200)
          }

          if (Data.CostingProfitDetail) {
            setTimeout(() => {
              setProfitValues(Data.CostingProfitDetail)
            }, 200)
          }

          setRejectionObj(Data.CostingRejectionDetail)

        }
      }))
    } else {
      setModelType([])
    }
  }

  /**
  * @method setOverheadValues
  * @description  SET OVERHEAD VALUES IN FIXED, COMBINED, RM, CC AND FIXED
  */
  const setOverheadValues = (dataObj) => {

    if (dataObj.IsOverheadFixedApplicable) {
      //setValue('OverheadFixedPercentage', dataObj.IsOverheadFixedApplicable ? dataObj.OverheadFixedPercentage : '')
      //setValue('OverheadFixedCost', headerCosts && headerCosts.NetTotalRMBOPCC)
      //setValue('OverheadFixedTotalCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * calculatePercentage(dataObj.OverheadFixedPercentage), 2))
    }

    if (dataObj.IsOverheadCombined) {
      setValue('OverheadCombinedPercentage', dataObj.IsOverheadCombined ? dataObj.OverheadCombinedPercentage : '')
      setValue('OverheadCombinedCost', headerCosts && headerCosts.NetTotalRMBOPCC)
      setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * calculatePercentage(dataObj.OverheadCombinedPercentage), 2))
    }

    if (dataObj.IsOverheadRMApplicable) {
      setValue('OverheadRMPercentage', dataObj.IsOverheadRMApplicable ? dataObj.OverheadRMPercentage : '')
      setValue('OverheadRMCost', headerCosts && headerCosts.NetRawMaterialsCost)
      setValue('OverheadRMTotalCost', checkForDecimalAndNull(headerCosts.NetRawMaterialsCost * calculatePercentage(dataObj.OverheadRMPercentage), 2))
    }

    if (dataObj.IsOverheadBOPApplicable) {
      setValue('OverheadBOPPercentage', dataObj.IsOverheadBOPApplicable ? dataObj.OverheadBOPPercentage : '')
      setValue('OverheadBOPCost', headerCosts && headerCosts.NetBoughtOutPartCost)
      setValue('OverheadBOPTotalCost', checkForDecimalAndNull(headerCosts.NetBoughtOutPartCost * calculatePercentage(dataObj.OverheadBOPPercentage), 2))
    }

    if (dataObj.IsOverheadCCApplicable) {
      setValue('OverheadCCPercentage', dataObj.IsOverheadCCApplicable ? dataObj.OverheadCCPercentage : '')
      setValue('OverheadCCCost', headerCosts && headerCosts.NetConversionCost)
      setValue('OverheadCCTotalCost', checkForDecimalAndNull(headerCosts.NetConversionCost * calculatePercentage(dataObj.OverheadCCPercentage), 2))
    }
  }

  /**
  * @method setProfitValues
  * @description  SET PROFIT VALUES IN FIXED, COMBINED, RM, CC AND FIXED
  */
  const setProfitValues = (dataObj) => {

    if (dataObj.IsProfitFixedApplicable) {
      //setValue('ProfitFixedPercentage', dataObj.IsProfitFixedApplicable ? dataObj.ProfitFixedPercentage : '')
      //setValue('ProfitFixedCost', headerCosts && headerCosts.NetTotalRMBOPCC)
      //setValue('ProfitFixedTotalCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * calculatePercentage(dataObj.ProfitFixedPercentage), 2))
    }

    if (dataObj.IsProfitCombined) {
      setValue('ProfitCombinedPercentage', dataObj.IsProfitCombined ? dataObj.ProfitCombinedPercentage : '')
      setValue('ProfitCombinedCost', headerCosts && headerCosts.NetTotalRMBOPCC)
      setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * calculatePercentage(dataObj.ProfitCombinedPercentage), 2))
    }

    if (dataObj.IsProfitRMApplicable) {
      setValue('ProfitRMPercentage', dataObj.IsProfitRMApplicable ? dataObj.ProfitRMPercentage : '')
      setValue('ProfitRMCost', headerCosts && headerCosts.NetRawMaterialsCost)
      setValue('ProfitRMTotalCost', checkForDecimalAndNull(headerCosts.NetRawMaterialsCost * calculatePercentage(dataObj.ProfitRMPercentage), 2))
    }

    if (dataObj.IsProfitBOPApplicable) {
      setValue('ProfitBOPPercentage', dataObj.IsProfitBOPApplicable ? dataObj.ProfitBOPPercentage : '')
      setValue('ProfitBOPCost', headerCosts && headerCosts.NetBoughtOutPartCost)
      setValue('ProfitBOPTotalCost', checkForDecimalAndNull(headerCosts.NetBoughtOutPartCost * calculatePercentage(dataObj.ProfitBOPPercentage), 2))
    }

    if (dataObj.IsProfitCCApplicable) {
      setValue('ProfitCCPercentage', dataObj.IsProfitCCApplicable ? dataObj.ProfitCCPercentage : '')
      setValue('ProfitCCCost', headerCosts && headerCosts.NetConversionCost)
      setValue('ProfitCCTotalCost', checkForDecimalAndNull(headerCosts.NetConversionCost * calculatePercentage(dataObj.ProfitCCPercentage), 2))
    }
  }

  /**
    * @method handleApplicabilityChange
    * @description  USED TO HANDLE APPLICABILITY CHANGE
    */
  const handleApplicabilityChange = (newValue) => {
    if (newValue && newValue !== '') {
      setApplicability(newValue)
      checkRejectionApplicability(newValue.label)
    } else {
      setApplicability([])
      checkRejectionApplicability('')
    }
  }

  /**
   * @method onPressInventory
   * @description  USED TO HANDLE INVENTORY CHANGE
   */
  const onPressInventory = () => {
    setIsInventoryApplicable(!IsInventoryApplicable)
  }

  /**
   * @method handleICCApplicabilityChange
   * @description  USED TO HANDLE ICC APPLICABILITY CHANGE
   */
  const handleICCApplicabilityChange = (newValue) => {
    if (newValue && newValue !== '') {
      setICCapplicability(newValue)
      dispatch(getInventoryDataByHeads(newValue.value, res => {
        if (res && res.status === 204) {
          setValue('InterestRatePercentage', '')
          setValue('InterestRateCost', '')
          setValue('NetICCTotal', '')
          checkInventoryApplicability('')
        } else {
          if (res && res.data && res.data.Result) {
            let Data = res.data.Data;
            setValue('InterestRatePercentage', Data.InterestRate)
            setICCInterestRateId(Data.InterestRateId)
            checkInventoryApplicability(newValue.label)
          }
        }
      }))
    } else {
      setICCapplicability([])
    }
  }

  /**
    * @method checkInventoryApplicability
    * @description INVENTORY APPLICABILITY CALCULATION
    */
  const checkInventoryApplicability = (Text) => {
    const { IsInventoryApplicable, } = InventoryObj;
    if (headerCosts !== undefined && Text !== '') {

      const RMBOP = headerCosts.NetRawMaterialsCost + headerCosts.NetBoughtOutPartCost;
      const RMCC = headerCosts.NetRawMaterialsCost + headerCosts.NetConversionCost;
      const InterestRatePercentage = getValues('InterestRatePercentage')

      switch (Text) {
        case 'RM':
          setValue('InterestRateCost', headerCosts.NetRawMaterialsCost)
          setValue('NetICCTotal', checkForDecimalAndNull(headerCosts.NetRawMaterialsCost * calculatePercentage(InterestRatePercentage), 2))
          break;

        case 'RM + CC':
          setValue('InterestRateCost', RMCC)
          setValue('NetICCTotal', checkForDecimalAndNull(RMCC * calculatePercentage(InterestRatePercentage), 2))
          break;

        case 'RM + BOP':
          setValue('InterestRateCost', RMBOP)
          setValue('NetICCTotal', checkForDecimalAndNull(RMBOP * calculatePercentage(InterestRatePercentage), 2))
          break;

        case 'RM + CC + BOP':
          setValue('InterestRateCost', headerCosts.NetTotalRMBOPCC)
          setValue('NetICCTotal', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * calculatePercentage(InterestRatePercentage), 2))
          break;

        case 'Fixed':
          setValue('InterestRateCost', headerCosts.NetTotalRMBOPCC)
          setValue('NetICCTotal', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * calculatePercentage(InterestRatePercentage), 2))
          break;

        case 'Annual ICC (%)':
          setValue('InterestRateCost', headerCosts.NetTotalRMBOPCC)
          setValue('NetICCTotal', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * calculatePercentage(InterestRatePercentage), 2))
          break;

        case 'Net Cost':
          setValue('InterestRateCost', headerCosts.NetTotalRMBOPCC)
          setValue('NetICCTotal', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * calculatePercentage(InterestRatePercentage), 2))
          break;

        default:
          break;
      }
    }
  }

  /**
   * @method onPressPaymentTerms
   * @description  USED TO HANDLE INVENTORY CHANGE
   */
  const onPressPaymentTerms = () => {
    setIsPaymentTermsApplicable(!IsPaymentTermsApplicable)
  }

  /**
   * @method handlePaymentTermsApplicabilityChange
   * @description  USED TO HANDLE PAYMENT TERM APPLICABILITY CHANGE
   */
  const handlePaymentTermsApplicabilityChange = (newValue) => {
    if (newValue && newValue !== '') {
      setPaymentTermsApplicability(newValue)
      dispatch(getPaymentTermsDataByHeads(newValue.value, res => {
        if (res.status === 204) {
          setValue('RepaymentPeriodDays', '')
          setValue('RepaymentPeriodPercentage', '')
          setValue('RepaymentPeriodCost', '')
          checkPaymentTermApplicability('')
        } else if (res && res.data && res.data.Result) {
          let Data = res.data.Data;
          setValue('RepaymentPeriodDays', Data.RepaymentPeriod)
          setValue('RepaymentPeriodPercentage', Data.InterestRate)
          setPaymentTermInterestRateId(Data.InterestRateId)
          checkPaymentTermApplicability(newValue.label)
        }
      }))
    } else {
      setPaymentTermsApplicability([])
    }
  }

  /**
    * @method checkPaymentTermApplicability
    * @description PAYMENT TERMS APPLICABILITY CALCULATION
    */
  const checkPaymentTermApplicability = (Text) => {
    const { IsInventoryApplicable, } = PaymentTermObj;
    if (headerCosts !== undefined && Text !== '') {

      const RMBOP = headerCosts.NetRawMaterialsCost + headerCosts.NetBoughtOutPartCost;
      const RMCC = headerCosts.NetRawMaterialsCost + headerCosts.NetConversionCost;
      const RepaymentPeriodDays = getValues('RepaymentPeriodDays')
      const RepaymentPeriodPercentage = getValues('RepaymentPeriodPercentage')

      switch (Text) {
        case 'RM':
          setValue('RepaymentPeriodCost', checkForDecimalAndNull(headerCosts.NetRawMaterialsCost * calculatePercentage(RepaymentPeriodPercentage), 2))
          break;

        case 'RM + CC':
          setValue('RepaymentPeriodCost', checkForDecimalAndNull(RMCC * calculatePercentage(RepaymentPeriodPercentage), 2))
          break;

        case 'RM + BOP':
          setValue('RepaymentPeriodCost', checkForDecimalAndNull(RMBOP * calculatePercentage(RepaymentPeriodPercentage), 2))
          break;

        case 'RM + CC + BOP':
          setValue('RepaymentPeriodCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * calculatePercentage(RepaymentPeriodPercentage), 2))
          break;

        case 'Fixed':
          setValue('RepaymentPeriodCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * calculatePercentage(RepaymentPeriodPercentage), 2))
          break;

        case 'Annual ICC (%)':
          setValue('RepaymentPeriodCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * calculatePercentage(RepaymentPeriodPercentage), 2))
          break;

        case 'Net Cost':
          setValue('RepaymentPeriodCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * calculatePercentage(RepaymentPeriodPercentage), 2))
          break;

        default:
          break;
      }
    }
  }


  /**
    * @method onSubmit
    * @description Used to Submit the form
    */
  const onSubmit = (values) => {
    props.saveCosting(values)
  }

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <div className="user-page p-0">
        <div>
          <form noValidate className="form" onSubmit={handleSubmit(onSubmit)} >
            <Row>
              <Col md="12">
                <div className="left-border">
                  {'Overhead & Profit:'}
                </div>
              </Col>


              <Col md="3">
                <SearchableSelectHookForm
                  label={'Model Type for Overhead/Profit'}
                  name={'ModelType'}
                  placeholder={'-Select-'}
                  Controller={Controller}
                  control={control}
                  rules={{ required: true }}
                  register={register}
                  defaultValue={modelType.length !== 0 ? modelType : ''}
                  options={renderListing('ModelType')}
                  mandatory={true}
                  handleChange={handleModelTypeChange}
                  errors={errors.ModelType}
                />
              </Col>

              <Col md="7">
                {''}
              </Col>

              <Col md="2">
                <label>
                  {'Net Overhead & Profit'}
                </label>
                {checkForDecimalAndNull(data.CostingPartDetails.OverheadCost, initialConfiguration.NumberOfDecimalForTransaction) + checkForDecimalAndNull(data.CostingPartDetails.ProfitCost, initialConfiguration.NumberOfDecimalForTransaction)}
              </Col>

              <Col md="12" className="mt25">
                <div className="left-border">
                  {`Overheads ${overheadObj && overheadObj.OverheadApplicability ? '(' + overheadObj.OverheadApplicability + ')' : ''}`}
                </div>
              </Col>

              <Col md="3">
                <label>
                  {'Overhead On'}
                </label>
              </Col>
              <Col md="3">
                <label>
                  {'Percentage (%)'}
                </label>
              </Col>
              <Col md="3">
                <label>
                  {'Cost(Applicability)'}
                </label>
              </Col>
              <Col md="3">
                <label>
                  {'Overhead'}
                </label>
              </Col>

              {
                overheadObj && overheadObj.IsOverheadFixedApplicable &&
                <>
                  <Col md="3">
                    <label>
                      {'Fixed'}
                    </label>
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'OverheadFixedPercentage'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      rules={{
                        required: false,
                        pattern: {
                          value: /^[0-9]\d*(\.\d+)?$/i,
                          message: 'Invalid Number.'
                        },
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.OverheadFixedPercentage}
                      disabled={false}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'OverheadFixedCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.OverheadFixedCost}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'OverheadFixedTotalCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.OverheadFixedTotalCost}
                      disabled={true}
                    />
                  </Col>

                </>
              }

              {
                overheadObj && overheadObj.IsOverheadCombined &&
                <>
                  <Col md="3">
                    <label>
                      {`${overheadObj && overheadObj.OverheadApplicability ? '(' + overheadObj.OverheadApplicability + ')' : ''}`}
                    </label>
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'OverheadPercentage'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={overheadObj.OverheadPercentage !== null ? overheadObj.OverheadPercentage : ''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.OverheadPercentage}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'OverheadCombinedCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={overheadObj.OverheadCombinedCost !== null ? overheadObj.OverheadCombinedCost : ''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.OverheadCombinedCost}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'OverheadCombinedTotalCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={overheadObj.OverheadCombinedTotalCost !== null ? overheadObj.OverheadCombinedTotalCost : ''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.OverheadCombinedTotalCost}
                      disabled={true}
                    />
                  </Col>

                </>
              }

              {
                overheadObj && overheadObj.IsOverheadRMApplicable &&
                <>
                  <Col md="3">
                    <label>
                      {'RM'}
                    </label>
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'OverheadRMPercentage'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.OverheadRMPercentage}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'OverheadRMCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.OverheadRMCost}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'OverheadRMTotalCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.OverheadRMTotalCost}
                      disabled={true}
                    />
                  </Col>

                </>
              }

              {
                overheadObj && overheadObj.IsOverheadBOPApplicable &&
                <>
                  <Col md="3">
                    <label>
                      {'BOP'}
                    </label>
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'OverheadBOPPercentage'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.OverheadBOPPercentage}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'OverheadBOPCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.OverheadBOPCost}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'OverheadBOPTotalCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.OverheadBOPTotalCost}
                      disabled={true}
                    />
                  </Col>
                </>
              }

              {
                overheadObj && overheadObj.IsOverheadCCApplicable &&
                <>
                  <Col md="3">
                    <label>
                      {'CC'}
                    </label>
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'OverheadCCPercentage'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.OverheadCCPercentage}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'OverheadCCCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.OverheadCCCost}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'OverheadCCTotalCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.OverheadCCTotalCost}
                      disabled={true}
                    />
                  </Col>
                </>
              }










              <Col md="12" className="mt25">
                <div className="left-border">
                  {`Profits ${profitObj && profitObj.OverheadApplicability ? '(' + profitObj.OverheadApplicability + ')' : ''}`}
                </div>
              </Col>

              <Col md="3">
                <label>
                  {'Profit On'}
                </label>
              </Col>
              <Col md="3">
                <label>
                  {'Percentage (%)'}
                </label>
              </Col>
              <Col md="3">
                <label>
                  {'Cost(Applicability)'}
                </label>
              </Col>
              <Col md="3">
                <label>
                  {'Profit'}
                </label>
              </Col>


              {
                profitObj && profitObj.IsProfitFixedApplicable &&
                <>
                  <Col md="3">
                    <label>
                      {'Fixed'}
                    </label>
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'ProfitFixedPercentage'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      rules={{
                        required: false,
                        pattern: {
                          value: /^[0-9]\d*(\.\d+)?$/i,
                          message: 'Invalid Number.'
                        },
                        // maxLength: 4,
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ProfitFixedPercentage}
                      disabled={false}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'ProfitFixedCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ProfitFixedCost}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'ProfitFixedTotalCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ProfitFixedTotalCost}
                      disabled={true}
                    />
                  </Col>

                </>
              }

              {
                profitObj && profitObj.IsProfitCombined &&
                <>
                  <Col md="3">
                    <label>
                      {`${profitObj && profitObj.OverheadApplicability ? '(' + profitObj.OverheadApplicability + ')' : ''}`}
                    </label>
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'ProfitPercentage'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ProfitPercentage}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'ProfitCombinedCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ProfitCombinedCost}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'ProfitCombinedTotalCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ProfitCombinedTotalCost}
                      disabled={true}
                    />
                  </Col>

                </>
              }

              {
                profitObj && profitObj.IsProfitRMApplicable &&
                <>
                  <Col md="3">
                    <label>
                      {'RM'}
                    </label>
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'ProfitRMPercentage'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ProfitRMPercentage}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'ProfitRMCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ProfitRMCost}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'ProfitRMTotalCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ProfitRMTotalCost}
                      disabled={true}
                    />
                  </Col>
                </>
              }

              {
                profitObj && profitObj.IsProfitBOPApplicable &&
                <>
                  <Col md="3">
                    <label>
                      {'BOP'}
                    </label>
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'ProfitBOPPercentage'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ProfitBOPPercentage}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'ProfitBOPCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ProfitBOPCost}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'ProfitBOPTotalCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ProfitBOPTotalCost}
                      disabled={true}
                    />
                  </Col>
                </>
              }

              {
                profitObj && profitObj.IsProfitCCApplicable &&
                <>
                  <Col md="3">
                    <label>
                      {'CC'}
                    </label>
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'ProfitCCPercentage'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ProfitCCPercentage}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'ProfitCCCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ProfitCCCost}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label=""
                      name={'ProfitCCTotalCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ProfitCCTotalCost}
                      disabled={true}
                    />
                  </Col>
                </>
              }

            </Row>




            <Row>
              <Col md="12" className="mt25">
                <div className="left-border">
                  {'Rejection:'}
                </div>
              </Col>

              <Col md="3">
                <SearchableSelectHookForm
                  label={'Applicability'}
                  name={'Applicability'}
                  placeholder={'-Select-'}
                  Controller={Controller}
                  control={control}
                  rules={{ required: true }}
                  register={register}
                  defaultValue={applicability.length !== 0 ? applicability : ''}
                  options={renderListing('Applicability')}
                  mandatory={true}
                  handleChange={handleApplicabilityChange}
                  errors={errors.Applicability}
                />
              </Col>
              <Col md="3">
                <TextFieldHookForm
                  label="Rejection (%)"
                  name={'RejectionPercentage'}
                  Controller={Controller}
                  control={control}
                  register={register}
                  mandatory={false}
                  rules={{
                    required: false,
                    pattern: {
                      value: /^[0-9]\d*(\.\d+)?$/i,
                      message: 'Invalid Number.'
                    },
                  }}
                  handleChange={() => { }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  errors={errors.RejectionPercentage}
                  disabled={false}
                />
              </Col>
              <Col md="3">
                <TextFieldHookForm
                  label="Cost(Applicability)"
                  name={'RejectionCost'}
                  Controller={Controller}
                  control={control}
                  register={register}
                  mandatory={false}
                  handleChange={() => { }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  errors={errors.RejectionCost}
                  disabled={true}
                />
              </Col>
              <Col md="3">
                <TextFieldHookForm
                  label="Net Rejection"
                  name={'RejectionTotalCost'}
                  Controller={Controller}
                  control={control}
                  register={register}
                  mandatory={false}
                  handleChange={() => { }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  errors={errors.RejectionTotalCost}
                  disabled={true}
                />
              </Col>
            </Row>




            <Row>
              <Col md="2" className="switch mb15">
                <label className="switch-level">
                  <div className={'left-title'}>{''}</div>
                  <Switch
                    onChange={onPressInventory}
                    checked={IsInventoryApplicable}
                    id="normal-switch"
                    disabled={false}
                    background="#4DC771"
                    onColor="#4DC771"
                    onHandleColor="#ffffff"
                    offColor="#CCC"
                    uncheckedIcon={false}
                    checkedIcon={false}
                    height={20}
                    width={46}
                  />
                  <div className={'right-title'}>Inventory Carrying Cost</div>
                </label>
              </Col>
              <Col md="10">
                {''}
              </Col>

              {IsInventoryApplicable &&
                <>
                  <Col md="3">
                    <SearchableSelectHookForm
                      label={'ICC Applicability'}
                      name={'ICCApplicability'}
                      placeholder={'-Select-'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      defaultValue={ICCapplicability.length !== 0 ? ICCapplicability : ''}
                      options={renderListing('ICCApplicability')}
                      mandatory={true}
                      handleChange={handleICCApplicabilityChange}
                      errors={errors.ICCApplicability}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label="Interest Rate(%)"
                      name={'InterestRatePercentage'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.InterestRatePercentage}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label="Cost(Applicability)"
                      name={'InterestRateCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.InterestRateCost}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label="Net ICC"
                      name={'NetICCTotal'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.NetICCTotal}
                      disabled={true}
                    />
                  </Col>
                </>}
            </Row>




            <Row>
              <Col md="2" className="switch mb15">
                <label className="switch-level">
                  <div className={'left-title'}>{''}</div>
                  <Switch
                    onChange={onPressPaymentTerms}
                    checked={IsPaymentTermsApplicable}
                    id="normal-switch"
                    disabled={false}
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
              <Col md="10">
                {''}
              </Col>

              {IsPaymentTermsApplicable &&
                <>
                  <Col md="3">
                    <SearchableSelectHookForm
                      label={'Payment Terms Applicability'}
                      name={'PaymentTermsApplicability'}
                      placeholder={'-Select-'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      defaultValue={paymentTermsApplicability.length !== 0 ? paymentTermsApplicability : ''}
                      options={renderListing('PaymentTermsApplicability')}
                      mandatory={true}
                      handleChange={handlePaymentTermsApplicabilityChange}
                      errors={errors.PaymentTermsApplicability}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label="Repayment Period(No. of Days)"
                      name={'RepaymentPeriodDays'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.RepaymentPeriodDays}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label="Interest Rate(%)"
                      name={'RepaymentPeriodPercentage'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.RepaymentPeriodPercentage}
                      disabled={true}
                    />
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
                </>}
            </Row>

            <Row className="sf-btn-footer no-gutters justify-content-between mt25">
              <div className="col-sm-12 text-right bluefooter-butn">
                <button
                  type={'submit'}
                  className="submit-button mr5 save-btn">
                  <div className={'check-icon'}><img src={require('../../../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
                  {'Save'}
                </button>
              </div>
            </Row>
          </form>
        </div>
      </div>

    </ >
  );
}

export default OverheadProfit;