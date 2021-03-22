import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller, useWatch, } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Row, } from 'reactstrap';
import { SearchableSelectHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs';
import { calculatePercentage, checkForDecimalAndNull, } from '../../../../../helper';
import { fetchModelTypeAPI, fetchCostingHeadsAPI, getICCAppliSelectListKeyValue, getPaymentTermsAppliSelectListKeyValue } from '../../../../../actions/Common';
import { getOverheadProfitDataByModelType, getInventoryDataByHeads, getPaymentTermsDataByHeads, } from '../../../actions/Costing';
import Switch from "react-switch";
import { costingInfoContext, netHeadCostContext } from '../../CostingDetailStepTwo';

function OverheadProfit(props) {
  const { data } = props;

  const { CostingOverheadDetail, CostingProfitDetail, CostingRejectionDetail, CostingInterestRateDetail } = props.data.CostingPartDetails;

  const ICCApplicabilityDetail = CostingInterestRateDetail && CostingInterestRateDetail.ICCApplicabilityDetail !== null ? CostingInterestRateDetail.ICCApplicabilityDetail : {}

  const PaymentTermDetail = CostingInterestRateDetail && CostingInterestRateDetail.PaymentTermDetail !== null ? CostingInterestRateDetail.PaymentTermDetail : {}

  const defaultValues = {

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

  const { register, handleSubmit, control, setValue, getValues, errors } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: defaultValues,
  });

  const dispatch = useDispatch()
  const headerCosts = useContext(netHeadCostContext);
  const costData = useContext(costingInfoContext);

  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)

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

  // setValue('ICCApplicability', ICCApplicabilityDetail !== undefined ? { label: ICCApplicabilityDetail.ICCApplicability, value: ICCApplicabilityDetail.ICCApplicability } : [])
  // setValue('PaymentTermsApplicability', PaymentTermDetail !== undefined ? { label: PaymentTermDetail.PaymentTermApplicability, value: PaymentTermDetail.PaymentTermApplicability } : [])

  //INITIAL CALLED EFFECT TO SET VALUES
  useEffect(() => {
    UpdateForm()

    if (data.CostingPartDetails && data.CostingPartDetails.ModelTypeId !== null) {
      handleModelTypeChange({ label: data.CostingPartDetails.ModelType, value: data.CostingPartDetails.ModelTypeId })
    }

    //GET FIXED VALUE IN GET API
    if (CostingOverheadDetail && CostingOverheadDetail.IsOverheadFixedApplicable) {
      setOverheadValues(CostingOverheadDetail, false)
    }

    //GET FIXED VALUE IN GET API
    if (CostingProfitDetail && CostingProfitDetail.IsProfitFixedApplicable) {
      setProfitValues(CostingProfitDetail, false)
    }

    if (ICCApplicabilityDetail !== undefined) {
      setValue('ICCApplicability', ICCApplicabilityDetail !== undefined ? { label: ICCApplicabilityDetail.ICCApplicability, value: ICCApplicabilityDetail.ICCApplicability } : [])
      setValue('PaymentTermsApplicability', PaymentTermDetail !== undefined ? { label: PaymentTermDetail.PaymentTermApplicability, value: PaymentTermDetail.PaymentTermApplicability } : [])
      setICCapplicability({ label: ICCApplicabilityDetail.ICCApplicability, value: ICCApplicabilityDetail.ICCApplicability })
      setICCInterestRateId(ICCApplicabilityDetail.InterestRateId)
    }

    if (PaymentTermDetail !== undefined) {
      setPaymentTermsApplicability({ label: PaymentTermDetail.PaymentTermApplicability, value: PaymentTermDetail.PaymentTermApplicability })
      setPaymentTermInterestRateId(PaymentTermDetail.InterestRateId)
    }

  }, []);

  /**
  * @method UpdateForm
  * @description UPDATE FORM ON EACH INITIAL RENDER
  */
  const UpdateForm = () => {
    checkIsOverheadCombined()
    checkIsOverheadRMApplicable()
    checkIsOverheadBOPApplicable()
    checkIsOverheadCCApplicable()

    checkIsProfitCombined()
    checkIsProfitRMApplicable()
    checkIsProfitBOPApplicable()
    checkIsProfitCCApplicable()
  }

  /**
  * @method useEffect
  * @description USED TO UPDATE WHEN MODEL TYPE CHANGE
  */
  useEffect(() => {
    UpdateForm()
  }, [overheadObj, profitObj])

  const overheadFieldValues = useWatch({
    control,
    name: ['OverheadFixedPercentage',],
  });

  const interestRateValues = useWatch({
    control,
    name: ['InterestRatePercentage',],
  });

  useEffect(() => {
    setTimeout(() => {
      let tempObj = {
        "OverheadId": overheadObj && overheadObj.OverheadId,
        "OverheadApplicabilityId": overheadObj && overheadObj.OverheadApplicabilityId,
        "OverheadApplicability": overheadObj && overheadObj.OverheadApplicability,

        "IsOverheadCombined": overheadObj && overheadObj.IsOverheadCombined,
        "OverheadPercentage": overheadObj && overheadObj.IsOverheadCombined ? getValues('OverheadPercentage') : '',
        "OverheadCombinedCost": overheadObj && overheadObj.IsOverheadCombined ? getValues('OverheadCombinedCost') : '',
        "OverheadCombinedTotalCost": overheadObj && overheadObj.IsOverheadCombined ? getValues('OverheadCombinedTotalCost') : '',

        "IsOverheadCCApplicable": overheadObj && overheadObj.IsOverheadCCApplicable,
        "OverheadCCPercentage": overheadObj && overheadObj.IsOverheadCCApplicable ? getValues('OverheadCCPercentage') : '',
        "OverheadCCCost": overheadObj && overheadObj.IsOverheadCCApplicable ? getValues('OverheadCCCost') : '',
        "OverheadCCTotalCost": overheadObj && overheadObj.IsOverheadCCApplicable ? getValues('OverheadCCTotalCost') : '',

        "IsOverheadBOPApplicable": overheadObj && overheadObj.IsOverheadBOPApplicable,
        "OverheadBOPPercentage": overheadObj && overheadObj.IsOverheadBOPApplicable ? getValues('OverheadBOPPercentage') : '',
        "OverheadBOPCost": overheadObj && overheadObj.IsOverheadBOPApplicable ? getValues('OverheadBOPCost') : '',
        "OverheadBOPTotalCost": overheadObj && overheadObj.IsOverheadBOPApplicable ? getValues('OverheadBOPTotalCost') : '',

        "IsOverheadRMApplicable": overheadObj && overheadObj.IsOverheadRMApplicable,
        "OverheadRMPercentage": overheadObj && overheadObj.IsOverheadRMApplicable ? getValues('OverheadRMPercentage') : '',
        "OverheadRMCost": overheadObj && overheadObj.IsOverheadRMApplicable ? getValues('OverheadRMCost') : '',
        "OverheadRMTotalCost": overheadObj && overheadObj.IsOverheadRMApplicable ? getValues('OverheadRMTotalCost') : '',

        "IsOverheadFixedApplicable": overheadObj && overheadObj.IsOverheadFixedApplicable,
        "OverheadFixedPercentage": overheadObj && overheadObj.IsOverheadFixedApplicable ? getValues('OverheadFixedPercentage') : '',
        "OverheadFixedCost": overheadObj && overheadObj.IsOverheadFixedApplicable ? getValues('OverheadFixedCost') : '',
        "OverheadFixedTotalCost": overheadObj && overheadObj.IsOverheadFixedApplicable ? getValues('OverheadFixedTotalCost') : '',

        "IsSurfaceTreatmentApplicable": true
      }

      let profitTempObj = {
        "ProfitId": profitObj && profitObj.ProfitId,
        "ProfitApplicabilityId": profitObj && profitObj.ProfitApplicabilityId,
        "ProfitApplicability": profitObj && profitObj.ProfitApplicability,

        "IsProfitCombined": profitObj && profitObj.IsProfitCombined,
        "ProfitPercentage": profitObj && profitObj.IsProfitCombined ? getValues('ProfitPercentage') : '',
        "ProfitCombinedCost": profitObj && profitObj.IsProfitCombined ? getValues('ProfitCombinedCost') : '',
        "ProfitCombinedTotalCost": profitObj && profitObj.IsProfitCombined ? getValues('ProfitCombinedTotalCost') : '',

        "IsProfitCCApplicable": profitObj && profitObj.IsProfitCCApplicable,
        "ProfitCCPercentage": profitObj && profitObj.IsProfitCCApplicable ? getValues('ProfitCCPercentage') : '',
        "ProfitCCCost": profitObj && profitObj.IsProfitCCApplicable ? getValues('ProfitCCCost') : '',
        "ProfitCCTotalCost": profitObj && profitObj.IsProfitCCApplicable ? getValues('ProfitCCTotalCost') : '',

        "IsProfitBOPApplicable": profitObj && profitObj.IsProfitBOPApplicable,
        "ProfitBOPPercentage": profitObj && profitObj.IsProfitBOPApplicable ? getValues('ProfitBOPPercentage') : '',
        "ProfitBOPCost": profitObj && profitObj.IsProfitBOPApplicable ? getValues('ProfitBOPCost') : '',
        "ProfitBOPTotalCost": profitObj && profitObj.IsProfitBOPApplicable ? getValues('ProfitBOPTotalCost') : '',

        "IsProfitRMApplicable": profitObj && profitObj.IsProfitRMApplicable,
        "ProfitRMPercentage": profitObj && profitObj.IsProfitRMApplicable ? getValues('ProfitRMPercentage') : '',
        "ProfitRMCost": profitObj && profitObj.IsProfitRMApplicable ? getValues('ProfitRMCost') : '',
        "ProfitRMTotalCost": profitObj && profitObj.IsProfitRMApplicable ? getValues('ProfitRMTotalCost') : '',

        "IsProfitFixedApplicable": profitObj && profitObj.IsProfitFixedApplicable,
        "ProfitFixedPercentage": profitObj && profitObj.IsProfitFixedApplicable ? getValues('ProfitFixedPercentage') : '',
        "ProfitFixedCost": profitObj && profitObj.IsProfitFixedApplicable ? getValues('ProfitFixedCost') : '',
        "ProfitFixedTotalCost": profitObj && profitObj.IsProfitFixedApplicable ? getValues('ProfitFixedTotalCost') : '',

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
    name: ['RejectionPercentage'],
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

  /***********changes done on 17-03********************/
  const handleRejection = () => {

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
  }

  const ICCFieldValues = useWatch({
    control,
    name: ['ICCApplicability'],
  });

  useEffect(() => {
    setTimeout(() => {
      let tempObj = {
        "InterestRateId": ICCApplicabilityDetail ? ICCInterestRateId : '',
        "IccDetailId": ICCApplicabilityDetail ? ICCApplicabilityDetail.IccDetailId : '',
        "ICCApplicability": IsInventoryApplicable ? ICCapplicability.label : '',
        "CostApplicability": IsInventoryApplicable ? getValues('InterestRateCost') : '',
        "InterestRate": IsInventoryApplicable ? getValues('InterestRatePercentage') : '',
        "NetCost": IsInventoryApplicable ? getValues('NetICCTotal') : '',
        "EffectiveDate": "",
      }

      props.setICCDetail(tempObj, { BOMLevel: data.BOMLevel, PartNumber: data.PartNumber })
    }, 200)
  }, [ICCFieldValues]);

  /***********changes done on 17-03********************/
  const handleICCDetail = () => {
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
  }

  const PaymentTermsFieldValues = useWatch({
    control,
    name: ['RepaymentPeriodCost'],
  });

  const PaymentTermsFixedFieldValues = useWatch({
    control,
    name: ['RepaymentPeriodDays'],
  });

  useEffect(() => {
    setTimeout(() => {
      let tempObj = {
        "InterestRateId": IsPaymentTermsApplicable ? PaymentTermInterestRateId : '',
        "PaymentTermDetailId": IsPaymentTermsApplicable ? PaymentTermDetail.IccDetailId : '',
        "PaymentTermApplicability": IsPaymentTermsApplicable ? paymentTermsApplicability.label : '',
        "RepaymentPeriod": IsPaymentTermsApplicable ? getValues('RepaymentPeriodDays') : '',
        "InterestRate": IsPaymentTermsApplicable ? getValues('RepaymentPeriodPercentage') : '',
        "NetCost": IsPaymentTermsApplicable ? getValues('RepaymentPeriodCost') : '',
        "EffectiveDate": ""
      }

      props.setPaymentTermsDetail(tempObj, { BOMLevel: data.BOMLevel, PartNumber: data.PartNumber })
    }, 200)
  }, [PaymentTermsFieldValues]);

  /***********changes done on 17-03********************/
  const handlePaymentTermsDetails = () => {
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
  }

  // //USEEFFECT CALLED FOR FIXED VALUES SELECTED IN DROPDOWN
  useEffect(() => {
    if (paymentTermsApplicability && paymentTermsApplicability.label === 'Fixed') {
      setValue('RepaymentPeriodCost', getValues('RepaymentPeriodDays'))
    }
  }, [PaymentTermsFixedFieldValues])

  useEffect(() => {
    dispatch(fetchModelTypeAPI('--Model Types--', (res) => { }))
    dispatch(fetchCostingHeadsAPI('--Costing Heads--', (res) => { }))
    dispatch(getICCAppliSelectListKeyValue((res) => { }))
    dispatch(getPaymentTermsAppliSelectListKeyValue((res) => { }))
    // handleRejection()
    // handleICCDetail()
    // handlePaymentTermsDetails()
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
    const { OverheadFixedPercentage } = overheadFieldValues;
    const { NetTotalRMBOPCC } = headerCosts;

    if (headerCosts !== undefined && OverheadFixedPercentage !== undefined && overheadObj && overheadObj.IsOverheadFixedApplicable) {
      setValue('OverheadFixedCost', NetTotalRMBOPCC)
      setValue('OverheadFixedTotalCost', checkForDecimalAndNull(NetTotalRMBOPCC * calculatePercentage(OverheadFixedPercentage), 2))
      setOverheadObj({
        ...overheadObj,
        OverheadFixedPercentage: OverheadFixedPercentage,
        OverheadFixedCost: NetTotalRMBOPCC,
        OverheadFixedTotalCost: checkForDecimalAndNull(NetTotalRMBOPCC * calculatePercentage(OverheadFixedPercentage), 2),
      })
    }

  }

  /**
  * @method checkIsOverheadCombined
  * @description OVERHEAD COMBINED CALCULATION
  */
  const checkIsOverheadCombined = () => {
    if (headerCosts !== undefined && overheadObj && overheadObj.IsOverheadCombined) {
      const { IsOverheadCombined, OverheadApplicability } = overheadObj;
      const OverheadCombinedText = OverheadApplicability;
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
      case 'RM + CC + BOP':
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
    if (headerCosts !== undefined && overheadObj && overheadObj.IsOverheadRMApplicable) {
      const { IsOverheadRMApplicable, OverheadRMPercentage } = overheadObj;
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
    if (headerCosts !== undefined && overheadObj && overheadObj.IsOverheadBOPApplicable) {
      const { IsOverheadBOPApplicable, OverheadBOPPercentage } = overheadObj;
      setValue('OverheadBOPPercentage', OverheadBOPPercentage)
      setValue('OverheadBOPCost', headerCosts.NetBoughtOutPartCost)
      setValue('OverheadBOPTotalCost', checkForDecimalAndNull(headerCosts.NetBoughtOutPartCost * calculatePercentage(OverheadBOPPercentage), 2))
    }
  }

  /**
  * @method checkIsOverheadCCApplicable
  * @description OVERHEAD CC APPLICABILITY CALCULATION
  */
  const checkIsOverheadCCApplicable = () => {
    if (headerCosts !== undefined && overheadObj && overheadObj.IsOverheadCCApplicable) {
      const { IsOverheadCCApplicable, OverheadCCPercentage } = overheadObj;
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
    const { ProfitFixedPercentage } = profitFieldValues;

    if (headerCosts !== undefined && ProfitFixedPercentage !== undefined && profitObj && profitObj.IsProfitFixedApplicable) {
      setValue('ProfitFixedCost', headerCosts.NetTotalRMBOPCC)
      setValue('ProfitFixedTotalCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * calculatePercentage(ProfitFixedPercentage), 2))
      setProfitObj({
        ...profitObj,
        ProfitFixedPercentage: ProfitFixedPercentage,
        ProfitFixedCost: headerCosts.NetTotalRMBOPCC,
        ProfitFixedTotalCost: checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * calculatePercentage(ProfitFixedPercentage), 2),
      })
    }
  }

  /**
  * @method checkIsProfitCombined
  * @description PROFIT COMBINED CALCULATION
  */
  const checkIsProfitCombined = () => {
    if (headerCosts !== undefined && profitObj && profitObj.IsProfitCombined) {
      const { IsProfitCombined, ProfitApplicability } = profitObj;
      // const ProfitCombinedText = 'RM + CC + BOP';
      const ProfitCombinedText = ProfitApplicability;
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
      case 'RM + CC + BOP':
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
    if (headerCosts !== undefined && profitObj && profitObj.IsProfitRMApplicable) {
      const { ProfitRMPercentage } = profitObj;
      setValue('ProfitRMPercentage', ProfitRMPercentage)
      setValue('ProfitRMCost', headerCosts.NetRawMaterialsCost)
      setValue('ProfitRMTotalCost', checkForDecimalAndNull(headerCosts.NetRawMaterialsCost * calculatePercentage(ProfitRMPercentage), 2))
    }
  }

  /**
  * @method checkIsProfitBOPApplicable
  * @description OVERHEAD BOP APPLICABILITY CALCULATION
  */
  const checkIsProfitBOPApplicable = () => {
    if (headerCosts !== undefined && profitObj && profitObj.IsProfitBOPApplicable) {
      const { IsProfitBOPApplicable, ProfitBOPPercentage } = profitObj;
      setValue('ProfitBOPPercentage', ProfitBOPPercentage)
      setValue('ProfitBOPCost', headerCosts.NetBoughtOutPartCost)
      setValue('ProfitBOPTotalCost', checkForDecimalAndNull(headerCosts.NetBoughtOutPartCost * calculatePercentage(ProfitBOPPercentage), 2))
    }
  }

  /**
    * @method checkIsProfitCCApplicable
    * @description PROFIT CC APPLICABILITY CALCULATION
    */
  const checkIsProfitCCApplicable = () => {
    if (headerCosts !== undefined && profitObj && profitObj.IsProfitCCApplicable) {
      const { IsProfitCCApplicable, ProfitCCPercentage } = profitObj;
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
      const reqParams = { ModelTypeId: newValue.value, IsVendor: costData.IsVendor }
      dispatch(getOverheadProfitDataByModelType(reqParams, res => {
        if (res && res.data && res.data.Data) {
          let Data = res.data.Data;
          setOverheadObj(Data.CostingOverheadDetail)
          setProfitObj(Data.CostingProfitDetail)

          if (Data.CostingOverheadDetail) {
            setTimeout(() => {
              setOverheadValues(Data.CostingOverheadDetail, true)
            }, 200)
          }

          if (Data.CostingProfitDetail) {
            setTimeout(() => {
              setProfitValues(Data.CostingProfitDetail, true)
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
  * @description  SET OVERHEAD VALUES IN FIXED, COMBINED, RM, CC AND BOP
  * @description IsAPIResponse, USED TO SET FIXED VALUE IN GET ON INITIAL LOAD API CALL
  */
  const setOverheadValues = (dataObj, IsAPIResponse) => {

    if (dataObj.IsOverheadFixedApplicable && IsAPIResponse === false) {
      setValue('OverheadFixedPercentage', dataObj.IsOverheadFixedApplicable ? dataObj.OverheadFixedPercentage : '')
      setValue('OverheadFixedCost', headerCosts && headerCosts.NetTotalRMBOPCC)
      setValue('OverheadFixedTotalCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * calculatePercentage(dataObj.OverheadFixedPercentage), 2))
    }

    if (dataObj.IsOverheadCombined && IsAPIResponse === false) {
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
  const setProfitValues = (dataObj, IsAPIResponse) => {

    if (dataObj.IsProfitFixedApplicable && IsAPIResponse === false) {
      setValue('ProfitFixedPercentage', dataObj.IsProfitFixedApplicable ? dataObj.ProfitFixedPercentage : '')
      setValue('ProfitFixedCost', headerCosts && headerCosts.NetTotalRMBOPCC)
      setValue('ProfitFixedTotalCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * calculatePercentage(dataObj.ProfitFixedPercentage), 2))
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
    // handleRejection()
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
      const reqParams = { Id: newValue.value, IsVendor: costData.IsVendor }
      dispatch(getInventoryDataByHeads(reqParams, res => {
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
    // handleICCDetail()
  }

  /**
    * @description SET VALUE IN NetICCTotal WHEN FIXED AND ENABLED 'InterestRatePercentage'
    */
  useEffect(() => {
    if (ICCapplicability && ICCapplicability.label === 'Fixed') {
      setValue('NetICCTotal', getValues('InterestRatePercentage'))
    }
  }, [interestRateValues])

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
      const reqParams = { Id: newValue.value, IsVendor: costData.IsVendor }
      dispatch(getPaymentTermsDataByHeads(reqParams, res => {
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
    // handlePaymentTermsDetails()
  }

  /**
    * @method checkPaymentTermApplicability
    * @description PAYMENT TERMS APPLICABILITY CALCULATION
    */
  const checkPaymentTermApplicability = (Text) => {
    if (headerCosts !== undefined && Text !== '') {

      const RMBOP = headerCosts.NetRawMaterialsCost + headerCosts.NetBoughtOutPartCost;
      const RMCC = headerCosts.NetRawMaterialsCost + headerCosts.NetConversionCost;
      const RepaymentPeriodDays = getValues('RepaymentPeriodDays')
      const RepaymentPeriodPercentage = getValues('RepaymentPeriodPercentage')
      const RepaymentCost = (calculatePercentage(RepaymentPeriodPercentage) / 90) * RepaymentPeriodDays;

      switch (Text) {
        case 'RM':
          setValue('RepaymentPeriodCost', checkForDecimalAndNull(headerCosts.NetRawMaterialsCost * RepaymentCost, 2))
          break;

        case 'RM + CC':
          setValue('RepaymentPeriodCost', checkForDecimalAndNull(RMCC * RepaymentCost, 2))
          break;

        case 'RM + BOP':
          setValue('RepaymentPeriodCost', checkForDecimalAndNull(RMBOP * RepaymentCost, 2))
          break;

        case 'RM + CC + BOP':
          setValue('RepaymentPeriodCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * RepaymentCost, 2))
          break;

        case 'Fixed':
          setValue('RepaymentPeriodCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * RepaymentCost, 2))
          break;

        case 'Annual ICC (%)':
          setValue('RepaymentPeriodCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * RepaymentCost, 2))
          break;

        case 'Net Cost':
          setValue('RepaymentPeriodCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * RepaymentCost, 2))
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
            </Row>

            <Row className="costing-border px-2 py-4 m-0 overhead-profit-tab-costing">

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

              <Col md="6">
                {''}
              </Col>

              <Col md="3" className="pl-0">
                <label>
                  {'Net Overhead & Profit'}
                </label>
                <input className="form-control" disabled value={checkForDecimalAndNull(data.CostingPartDetails.OverheadCost, initialConfiguration.NumberOfDecimalForTransaction) + checkForDecimalAndNull(data.CostingPartDetails.ProfitCost, initialConfiguration.NumberOfDecimalForTransaction)} />
              </Col>

              <Col md="12" className="">
                <div className="left-border">
                  {`Overheads ${overheadObj && overheadObj.OverheadApplicability ? '(' + overheadObj.OverheadApplicability + ')' : ''}`}
                </div>
              </Col>

              <Col md="12">
                <Row className="costing-border-inner-section m-0">
                  <Col md="3">
                    <span className="head-text">
                      {'Overhead On'}
                    </span>
                  </Col>
                  <Col md="3">
                    <span className="head-text">
                      {'Percentage (%)'}
                    </span>
                  </Col>
                  <Col md="3">
                    <span className="head-text">
                      {'Cost(Applicability)'}
                    </span>
                  </Col>
                  <Col md="3">
                    <span className="head-text">
                      {'Overhead'}
                    </span>
                  </Col>


                  {
                    overheadObj && overheadObj.IsOverheadFixedApplicable &&
                    <>
                      <Col md="3">
                        <label className="col-label">
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
                        <label className="col-label">
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
                        <label className="col-label">
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
                        <label className="col-label">
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
                        <label className="col-label">
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
                </Row>
              </Col>

              {/* new section from below with heasing */}
              <Col md="12" className="pt-3">
                <div className="left-border">
                  {`Profits ${profitObj && profitObj.OverheadApplicability ? '(' + profitObj.OverheadApplicability + ')' : ''}`}
                </div>
              </Col>
              <Col md="12">
                <Row className="costing-border-inner-section m-0">
                  <Col md="3">
                    <span className="head-text">
                      {'Profit On'}
                    </span>
                  </Col>
                  <Col md="3">
                    <span className="head-text">
                      {'Percentage (%)'}
                    </span>
                  </Col>
                  <Col md="3">
                    <span className="head-text">
                      {'Cost(Applicability)'}
                    </span>
                  </Col>
                  <Col md="3">
                    <span className="head-text">
                      {'Profit'}
                    </span>
                  </Col>


                  {
                    profitObj && profitObj.IsProfitFixedApplicable &&
                    <>
                      <Col md="3">
                        <label className="col-label">
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
                        <label className="col-label">
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
                        <label className="col-label">
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
                        <label className="col-label">
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
                        <label className="col-label">
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
              </Col>
            </Row>



            <Row>
              <Col md="12" className="pt-3">
                <div className="left-border">
                  {'Rejection:'}
                </div>
              </Col>
            </Row>
            <Row className="costing-border costing-border-with-labels px-2 py-3 m-0 overhead-profit-tab-costing">
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
                  label={`Rejection ${applicability.label !== 'Fixed' ? '(%)' : ''}`}
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
                  // handleChange={handleRejection}
                  handleChange={() => { }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  errors={errors.RejectionPercentage}
                  disabled={false}
                />
              </Col>
              {applicability.label !== 'Fixed' &&
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
                </Col>}
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




            <Row className="mt-15 pt-15">
              <Col md="12" className="switch mb-2">
                <label className="switch-level">
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
            </Row>
            {IsInventoryApplicable &&
              <Row className="costing-border costing-border-with-labels px-2 py-3 m-0 overhead-profit-tab-costing">
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
                      label={`Interest Rate ${ICCapplicability.label !== 'Fixed' ? '(%)' : ''}`}
                      name={'InterestRatePercentage'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      // handleChange={handleICCDetail}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.InterestRatePercentage}
                      disabled={ICCapplicability.label !== 'Fixed' ? true : false}
                    />
                  </Col>
                  {ICCapplicability.label !== 'Fixed' &&
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
                    </Col>}
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
                </>
              </Row>
            }





            <Row className="mt-15 pt-15">
              <Col md="12" className="switch mb-2">
                <label className="switch-level">
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
            </Row>
            {IsPaymentTermsApplicable &&
              <Row className="costing-border costing-border-with-labels px-2 py-3 m-0 overhead-profit-tab-costing mb-4">
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
                      disabled={paymentTermsApplicability.label !== 'Fixed' ? true : false}
                    />
                  </Col>
                  {paymentTermsApplicability.label !== 'Fixed' &&
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
                    </Col>}
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


            <Row className="sf-btn-footer no-gutters justify-content-between costing-overhead-profit-footer">
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

export default React.memo(OverheadProfit);