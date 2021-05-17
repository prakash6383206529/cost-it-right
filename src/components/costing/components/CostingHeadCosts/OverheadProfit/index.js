import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller, useWatch, } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Row, } from 'reactstrap';
import { NumberFieldHookForm, SearchableSelectHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs';
import { calculatePercentage, checkForDecimalAndNull, checkForNull, } from '../../../../../helper';
import { fetchModelTypeAPI, fetchCostingHeadsAPI, getICCAppliSelectListKeyValue, getPaymentTermsAppliSelectListKeyValue } from '../../../../../actions/Common';
import { getOverheadProfitDataByModelType, getInventoryDataByHeads, getPaymentTermsDataByHeads, gridDataAdded, } from '../../../actions/Costing';
import Switch from "react-switch";
import { costingInfoContext, netHeadCostContext, SurfaceCostContext } from '../../CostingDetailStepTwo';
import { EMPTY_GUID } from '../../../../../config/constants';
import { ViewCostingContext } from '../../CostingDetails';

let counter = 0;
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
  const CostingViewMode = useContext(ViewCostingContext);
  const SurfaceTreatmentCost = useContext(SurfaceCostContext);

  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const { CostingEffectiveDate, IsIncludedSurfaceInOverheadProfit } = useSelector(state => state.costing)

  const [overheadObj, setOverheadObj] = useState(CostingOverheadDetail)
  const [profitObj, setProfitObj] = useState(CostingProfitDetail)
  const [rejectionObj, setRejectionObj] = useState(CostingRejectionDetail)
  const [InventoryObj, setInventoryObj] = useState(ICCApplicabilityDetail)
  const [PaymentTermObj, setPaymentTermObj] = useState(PaymentTermDetail)

  const [modelType, setModelType] = useState(data.CostingPartDetails && data.CostingPartDetails.ModelType !== null ? { label: data.CostingPartDetails.ModelType, value: data.CostingPartDetails.ModelTypeId } : [])

  const [applicability, setApplicability] = useState(CostingRejectionDetail && CostingRejectionDetail.RejectionApplicability !== null ? { label: CostingRejectionDetail.RejectionApplicability, value: CostingRejectionDetail.RejectionApplicabilityId } : [])
  const [IsChangedApplicability, setIsChangedApplicability] = useState(false)

  const [IsInventoryApplicable, setIsInventoryApplicable] = useState(CostingInterestRateDetail && CostingInterestRateDetail.IsInventoryCarringCost ? true : false)
  const [ICCapplicability, setICCapplicability] = useState(ICCApplicabilityDetail !== undefined ? { label: ICCApplicabilityDetail.ICCApplicability, value: ICCApplicabilityDetail.ICCApplicability } : [])

  const [ICCInterestRateId, setICCInterestRateId] = useState(ICCApplicabilityDetail !== undefined ? ICCApplicabilityDetail.InterestRateId : '')

  const [IsPaymentTermsApplicable, setIsPaymentTermsApplicable] = useState(CostingInterestRateDetail && CostingInterestRateDetail.NetPaymentTermCost === 0 ? false : true)
  const [paymentTermsApplicability, setPaymentTermsApplicability] = useState(PaymentTermDetail !== undefined ? { label: PaymentTermDetail.PaymentTermApplicability, value: PaymentTermDetail.PaymentTermApplicability } : [])
  const [PaymentTermInterestRateId, setPaymentTermInterestRateId] = useState(PaymentTermDetail !== undefined ? PaymentTermDetail.InterestRateId : '')

  const [IsSurfaceTreatmentAdded, setIsSurfaceTreatmentAdded] = useState(false)

  //INITIAL CALLED EFFECT TO SET VALUES
  useEffect(() => {
    UpdateForm()

    if (data.CostingPartDetails && data.CostingPartDetails.ModelTypeId !== null) {
      handleModelTypeChange({ label: data.CostingPartDetails.ModelType, value: data.CostingPartDetails.ModelTypeId })
    }

    //GET FIXED VALUE IN GET API
    if (Object.keys(CostingOverheadDetail).length > 0) {
      setOverheadValues(CostingOverheadDetail, false)
    }

    //GET FIXED VALUE IN GET API
    if (Object.keys(CostingProfitDetail).length > 0) {
      setProfitValues(CostingProfitDetail, false)
    }

    if (Object.keys(ICCApplicabilityDetail).length > 0) {
      //setValue('ICCApplicability', ICCApplicabilityDetail !== undefined ? { label: ICCApplicabilityDetail.ICCApplicability, value: ICCApplicabilityDetail.ICCApplicability } : [])
      //setValue('PaymentTermsApplicability', PaymentTermDetail !== undefined ? { label: PaymentTermDetail.PaymentTermApplicability, value: PaymentTermDetail.PaymentTermApplicability } : [])
      //setICCInterestRateId(ICCApplicabilityDetail.InterestRateId)
    }

    if (Object.keys(PaymentTermDetail).length > 0) {
      // setPaymentTermsApplicability({ label: PaymentTermDetail.PaymentTermApplicability, value: PaymentTermDetail.PaymentTermApplicability })
      // setPaymentTermInterestRateId(PaymentTermDetail.InterestRateId)
    }

    setTimeout(() => {
      IncludeSurfaceTreatmentCall()
    }, 3000)

  }, []);

  useEffect(() => {
    IncludeSurfaceTreatmentCall()
  }, [IsIncludedSurfaceInOverheadProfit])

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
  * @description TO CHANGE OVERHEADS VALUE WHEN RM BOP CC VALUES CHANGES FROM RMCC TAB
  */
  useEffect(() => {

    if (modelType && modelType.value !== undefined) {
      handleModelTypeChange(modelType)
      IncludeSurfaceTreatmentCall()
    }

    if (applicability && applicability.value !== undefined) {
      setApplicability(applicability)
      checkRejectionApplicability(applicability.label)
    }

  }, [headerCosts.NetTotalRMBOPCC])

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

  const profitFieldValues = useWatch({
    control,
    name: ['ProfitFixedPercentage',],
  });

  const rejectionFieldValues = useWatch({
    control,
    name: ['RejectionPercentage', 'Applicability'],
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

        "IsSurfaceTreatmentApplicable": IsIncludedSurfaceInOverheadProfit,
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

        "IsSurfaceTreatmentApplicable": IsIncludedSurfaceInOverheadProfit,
      }

      props.setOverheadDetail({ overheadObj: tempObj, profitObj: profitTempObj, modelType: modelType }, { BOMLevel: data.BOMLevel, PartNumber: data.PartNumber })
    }, 500)

  }, [overheadObj, profitObj]);

  useEffect(() => {

    if (applicability.label === 'Fixed' && IsIncludedSurfaceInOverheadProfit) {
      checkRejectionApplicability(applicability.label)
    } else if (IsIncludedSurfaceInOverheadProfit === false) {
      checkRejectionApplicability(applicability.label)
    } else if (applicability.label !== 'Fixed' && IsIncludedSurfaceInOverheadProfit) {
      setIsSurfaceTreatmentAdded(false)
      IncludeSurfaceTreatmentCall()
    }

    setTimeout(() => {
      let tempObj = {
        "RejectionApplicabilityId": applicability ? applicability.value : '',
        "RejectionApplicability": applicability ? applicability.label : '',
        "RejectionPercentage": applicability ? getValues('RejectionPercentage') : '',
        "RejectionCost": applicability ? getValues('RejectionCost') : '',
        "RejectionTotalCost": applicability ? getValues('RejectionTotalCost') : '',
        "IsSurfaceTreatmentApplicable": true,
      }

      props.setRejectionDetail(tempObj, { BOMLevel: data.BOMLevel, PartNumber: data.PartNumber })
    }, 200)

  }, [rejectionFieldValues]);

  const ICCFieldValues = useWatch({
    control,
    name: ['ICCApplicability',],
  });

  useEffect(() => {

    if (IsIncludedSurfaceInOverheadProfit) {
      setIsSurfaceTreatmentAdded(false)
      IncludeSurfaceTreatmentCall()
    } else {
      checkInventoryApplicability(ICCapplicability?.label)
    }

    setTimeout(() => {
      let tempObj = {
        "InterestRateId": ICCapplicability.label !== 'Fixed' ? (ICCApplicabilityDetail ? ICCInterestRateId : '') : null,
        "IccDetailId": ICCApplicabilityDetail ? ICCApplicabilityDetail.IccDetailId : '',
        "ICCApplicability": ICCapplicability.value,
        "CostApplicability": IsInventoryApplicable ? getValues('InterestRateCost') : '',
        "InterestRate": IsInventoryApplicable ? getValues('InterestRatePercentage') : '',
        "NetCost": IsInventoryApplicable ? getValues('NetICCTotal') : '',
        "EffectiveDate": "",
      }

      props.setICCDetail(tempObj, { BOMLevel: data.BOMLevel, PartNumber: data.PartNumber })
    }, 200)
  }, [ICCFieldValues, interestRateValues, IsIncludedSurfaceInOverheadProfit]);

  const PaymentTermsFieldValues = useWatch({
    control,
    name: ['RepaymentPeriodCost'],
  });

  const PaymentTermsFixedFieldValues = useWatch({
    control,
    name: ['RepaymentPeriodPercentage'],
  });

  useEffect(() => {
    setTimeout(() => {
      let tempObj = {
        "InterestRateId": paymentTermsApplicability.label !== 'Fixed' ? (IsPaymentTermsApplicable ? PaymentTermInterestRateId : '') : null,
        "PaymentTermDetailId": IsPaymentTermsApplicable ? PaymentTermDetail.IccDetailId : '',
        "PaymentTermApplicability": paymentTermsApplicability.label,
        "RepaymentPeriod": IsPaymentTermsApplicable ? getValues('RepaymentPeriodDays') : '',
        "InterestRate": IsPaymentTermsApplicable ? getValues('RepaymentPeriodPercentage') : '',
        "NetCost": IsPaymentTermsApplicable ? getValues('RepaymentPeriodCost') : '',
        "EffectiveDate": ""
      }

      props.setPaymentTermsDetail(tempObj, { BOMLevel: data.BOMLevel, PartNumber: data.PartNumber })
    }, 200)
  }, [PaymentTermsFieldValues]);

  // //USEEFFECT CALLED FOR FIXED VALUES SELECTED IN DROPDOWN
  useEffect(() => {
    if (paymentTermsApplicability && paymentTermsApplicability.label === 'Fixed') {
      setValue('RepaymentPeriodCost', getValues('RepaymentPeriodPercentage'))
    }
  }, [PaymentTermsFixedFieldValues])

  useEffect(() => {
    dispatch(fetchModelTypeAPI('--Model Types--', (res) => { }))
    dispatch(fetchCostingHeadsAPI('--Costing Heads--', (res) => { }))
    dispatch(getICCAppliSelectListKeyValue((res) => { }))
    dispatch(getPaymentTermsAppliSelectListKeyValue((res) => { }))
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

    if (headerCosts !== undefined && OverheadFixedPercentage !== undefined && overheadObj && overheadObj.IsOverheadFixedApplicable) {
      setValue('OverheadFixedCost', '-')
      setValue('OverheadFixedTotalCost', checkForDecimalAndNull(OverheadFixedPercentage, initialConfiguration.NoOfDecimalForPrice))
      setOverheadObj({
        ...overheadObj,
        OverheadFixedPercentage: OverheadFixedPercentage,
        OverheadFixedCost: '-',
        OverheadFixedTotalCost: checkForDecimalAndNull(OverheadFixedPercentage, initialConfiguration.NoOfDecimalForPrice),
      })
    }

  }

  /**
  * @method checkIsOverheadCombined
  * @description OVERHEAD COMBINED CALCULATION
  */
  const checkIsOverheadCombined = () => {
    if (headerCosts !== undefined && overheadObj && overheadObj.IsOverheadCombined) {
      const { OverheadApplicability } = overheadObj;
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
        //setValue('OverheadCombinedCost', headerCosts.NetTotalRMBOPCC)
        //setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * calculatePercentage(OverheadPercentage), initialConfiguration.NoOfDecimalForPrice))
        break;

      case 'RM + BOP':
        const RMBOP = headerCosts.NetRawMaterialsCost + headerCosts.NetBoughtOutPartCost;
        setValue('OverheadPercentage', OverheadPercentage)
        setValue('OverheadCombinedCost', RMBOP)
        setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(RMBOP * calculatePercentage(OverheadPercentage), initialConfiguration.NoOfDecimalForPrice))
        break;

      case 'RM + CC':
        const RMCC = headerCosts.NetRawMaterialsCost + headerCosts.NetConversionCost;
        setValue('OverheadPercentage', OverheadPercentage)
        //setValue('OverheadCombinedCost', RMCC)
        //setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(RMCC * calculatePercentage(OverheadPercentage), initialConfiguration.NoOfDecimalForPrice))
        break;

      case 'BOP + CC':
        const BOPCC = headerCosts.NetBoughtOutPartCost + headerCosts.NetConversionCost;
        setValue('OverheadPercentage', OverheadPercentage)
        //setValue('OverheadCombinedCost', BOPCC)
        //setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(BOPCC * calculatePercentage(OverheadPercentage), initialConfiguration.NoOfDecimalForPrice))
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
      const { OverheadRMPercentage } = overheadObj;
      setValue('OverheadRMPercentage', OverheadRMPercentage)
      setValue('OverheadRMCost', headerCosts.NetRawMaterialsCost)
      setValue('OverheadRMTotalCost', checkForDecimalAndNull(headerCosts.NetRawMaterialsCost * calculatePercentage(OverheadRMPercentage), initialConfiguration.NoOfDecimalForPrice))
    }
  }


  /**
  * @method checkIsOverheadBOPApplicable
  * @description OVERHEAD BOP APPLICABILITY CALCULATION
  */
  const checkIsOverheadBOPApplicable = () => {
    if (headerCosts !== undefined && overheadObj && overheadObj.IsOverheadBOPApplicable) {
      const { OverheadBOPPercentage } = overheadObj;
      setValue('OverheadBOPPercentage', OverheadBOPPercentage)
      setValue('OverheadBOPCost', headerCosts.NetBoughtOutPartCost)
      setValue('OverheadBOPTotalCost', checkForDecimalAndNull(headerCosts.NetBoughtOutPartCost * calculatePercentage(OverheadBOPPercentage), initialConfiguration.NoOfDecimalForPrice))
    }
  }

  /**
  * @method checkIsOverheadCCApplicable
  * @description OVERHEAD CC APPLICABILITY CALCULATION
  */
  const checkIsOverheadCCApplicable = () => {
    if (headerCosts !== undefined && overheadObj && overheadObj.IsOverheadCCApplicable) {
      const { OverheadCCPercentage } = overheadObj;
      setValue('OverheadCCPercentage', OverheadCCPercentage)
      //setValue('OverheadCCCost', headerCosts.NetConversionCost)

      /**
       *  IF INCLUDE SURFACE TREATMENT(CHECKBOX FUNCTIONALITY), IS NOT IS USE THEN UNCOMMENT BELOW LINE
       *  AND COMMENT THIS FUNCTION IncludeSurfaceTreatmentCall()
       */
      // setValue('OverheadCCTotalCost', checkForDecimalAndNull(headerCosts.NetConversionCost * calculatePercentage(OverheadCCPercentage), initialConfiguration.NoOfDecimalForPrice))
    }
  }

  /**
  * @method calculateProfitFixedTotalCost
  * @description CALCULATE PROFIT FIXED TOTAL COST
  */
  const calculateProfitFixedTotalCost = () => {
    const { ProfitFixedPercentage } = profitFieldValues;

    if (headerCosts !== undefined && ProfitFixedPercentage !== undefined && profitObj && profitObj.IsProfitFixedApplicable) {
      setValue('ProfitFixedCost', '-')
      setValue('ProfitFixedTotalCost', checkForDecimalAndNull(ProfitFixedPercentage, initialConfiguration.NoOfDecimalForPrice))
      setProfitObj({
        ...profitObj,
        ProfitFixedPercentage: ProfitFixedPercentage,
        ProfitFixedCost: '-',
        ProfitFixedTotalCost: checkForDecimalAndNull(ProfitFixedPercentage, initialConfiguration.NoOfDecimalForPrice),
      })
    }
  }

  /**
  * @method checkIsProfitCombined
  * @description PROFIT COMBINED CALCULATION
  */
  const checkIsProfitCombined = () => {
    if (headerCosts !== undefined && profitObj && profitObj.IsProfitCombined) {
      const { ProfitApplicability } = profitObj;
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
        //setValue('ProfitCombinedCost', headerCosts.NetTotalRMBOPCC)
        //setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * calculatePercentage(ProfitPercentage), initialConfiguration.NoOfDecimalForPrice))
        break;

      case 'RM + BOP':
        const RMBOP = headerCosts.NetRawMaterialsCost + headerCosts.NetBoughtOutPartCost;
        setValue('ProfitPercentage', ProfitPercentage)
        setValue('ProfitCombinedCost', checkForDecimalAndNull(RMBOP, initialConfiguration.NoOfDecimalForPrice))
        setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(RMBOP * calculatePercentage(ProfitPercentage), initialConfiguration.NoOfDecimalForPrice))
        break;

      case 'RM + CC':
        const RMCC = headerCosts.NetRawMaterialsCost + headerCosts.NetConversionCost;
        setValue('ProfitPercentage', ProfitPercentage)
        //setValue('ProfitCombinedCost', checkForDecimalAndNull(RMCC, initialConfiguration.NoOfDecimalForPrice))
        //setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(RMCC * calculatePercentage(ProfitPercentage), initialConfiguration.NoOfDecimalForPrice))
        break;

      case 'BOP + CC':
        const BOPCC = headerCosts.NetBoughtOutPartCost + headerCosts.NetConversionCost;
        setValue('ProfitPercentage', ProfitPercentage)
        //setValue('ProfitCombinedCost', checkForDecimalAndNull(BOPCC, initialConfiguration.NoOfDecimalForPrice))
        //setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(BOPCC * calculatePercentage(ProfitPercentage), initialConfiguration.NoOfDecimalForPrice))
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
      setValue('ProfitRMTotalCost', checkForDecimalAndNull(headerCosts.NetRawMaterialsCost * calculatePercentage(ProfitRMPercentage), initialConfiguration.NoOfDecimalForPrice))
    }
  }

  /**
  * @method checkIsProfitBOPApplicable
  * @description OVERHEAD BOP APPLICABILITY CALCULATION
  */
  const checkIsProfitBOPApplicable = () => {
    if (headerCosts !== undefined && profitObj && profitObj.IsProfitBOPApplicable) {
      const { ProfitBOPPercentage } = profitObj;
      setValue('ProfitBOPPercentage', ProfitBOPPercentage)
      setValue('ProfitBOPCost', headerCosts.NetBoughtOutPartCost)
      setValue('ProfitBOPTotalCost', checkForDecimalAndNull(headerCosts.NetBoughtOutPartCost * calculatePercentage(ProfitBOPPercentage), initialConfiguration.NoOfDecimalForPrice))
    }
  }

  /**
    * @method checkIsProfitCCApplicable
    * @description PROFIT CC APPLICABILITY CALCULATION
    */
  const checkIsProfitCCApplicable = () => {
    if (headerCosts !== undefined && profitObj && profitObj.IsProfitCCApplicable) {
      const { ProfitCCPercentage } = profitObj;
      setValue('ProfitCCPercentage', ProfitCCPercentage)
      //setValue('ProfitCCCost', headerCosts.NetConversionCost)

      /**
       *  IF INCLUDE SURFACE TREATMENT(CHECKBOX FUNCTIONALITY), IS NOT IS USE THEN UNCOMMENT BELOW LINE
       *  AND COMMENT THIS FUNCTION IncludeSurfaceTreatmentCall()
       */
      //setValue('ProfitCCTotalCost', checkForDecimalAndNull(headerCosts.NetConversionCost * calculatePercentage(ProfitCCPercentage), initialConfiguration.NoOfDecimalForPrice))
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
          setValue('RejectionCost', headerCosts.NetRawMaterialsCost)
          setValue('RejectionTotalCost', checkForDecimalAndNull(headerCosts.NetRawMaterialsCost * calculatePercentage(RejectionPercentage), initialConfiguration.NoOfDecimalForPrice))
          setRejectionObj({
            ...rejectionObj,
            RejectionApplicabilityId: applicability.value,
            RejectionApplicability: applicability.label,
            RejectionPercentage: RejectionPercentage,
            RejectionCost: headerCosts.NetRawMaterialsCost,
            RejectionTotalCost: checkForDecimalAndNull(headerCosts.NetRawMaterialsCost * calculatePercentage(RejectionPercentage), initialConfiguration.NoOfDecimalForPrice)
          })
          break;

        case 'BOP':
          setValue('RejectionCost', headerCosts.NetBoughtOutPartCost)
          setValue('RejectionTotalCost', checkForDecimalAndNull(headerCosts.NetBoughtOutPartCost * calculatePercentage(RejectionPercentage), initialConfiguration.NoOfDecimalForPrice))
          setRejectionObj({
            ...rejectionObj,
            RejectionApplicabilityId: applicability.value,
            RejectionApplicability: applicability.label,
            RejectionPercentage: RejectionPercentage,
            RejectionCost: headerCosts.NetBoughtOutPartCost,
            RejectionTotalCost: checkForDecimalAndNull(headerCosts.NetBoughtOutPartCost * calculatePercentage(RejectionPercentage), initialConfiguration.NoOfDecimalForPrice)
          })
          break;

        case 'CC':
          setValue('RejectionCost', headerCosts.NetConversionCost)
          setValue('RejectionTotalCost', checkForDecimalAndNull(headerCosts.NetConversionCost * calculatePercentage(RejectionPercentage), initialConfiguration.NoOfDecimalForPrice))
          setRejectionObj({
            ...rejectionObj,
            RejectionApplicabilityId: applicability.value,
            RejectionApplicability: applicability.label,
            RejectionPercentage: RejectionPercentage,
            RejectionCost: headerCosts.NetConversionCost,
            RejectionTotalCost: checkForDecimalAndNull(headerCosts.NetConversionCost * calculatePercentage(RejectionPercentage), initialConfiguration.NoOfDecimalForPrice)
          })
          break;

        case 'RM + CC + BOP':
          setValue('RejectionCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC, initialConfiguration.NoOfDecimalForPrice))
          setValue('RejectionTotalCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * calculatePercentage(RejectionPercentage), initialConfiguration.NoOfDecimalForPrice))
          setRejectionObj({
            ...rejectionObj,
            RejectionApplicabilityId: applicability.value,
            RejectionApplicability: applicability.label,
            RejectionPercentage: RejectionPercentage,
            RejectionCost: headerCosts.NetTotalRMBOPCC,
            RejectionTotalCost: checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * calculatePercentage(RejectionPercentage), initialConfiguration.NoOfDecimalForPrice)
          })
          break;

        case 'RM + BOP':
          setValue('RejectionCost', checkForDecimalAndNull(RMBOP, initialConfiguration.NoOfDecimalForPrice))
          setValue('RejectionTotalCost', checkForDecimalAndNull(RMBOP * calculatePercentage(RejectionPercentage), initialConfiguration.NoOfDecimalForPrice))
          setRejectionObj({
            ...rejectionObj,
            RejectionApplicabilityId: applicability.value,
            RejectionApplicability: applicability.label,
            RejectionPercentage: RejectionPercentage,
            RejectionCost: RMBOP,
            RejectionTotalCost: checkForDecimalAndNull(RMBOP * calculatePercentage(RejectionPercentage), initialConfiguration.NoOfDecimalForPrice)
          })
          break;

        case 'RM + CC':
          setValue('RejectionCost', checkForDecimalAndNull(RMCC, initialConfiguration.NoOfDecimalForPrice))
          setValue('RejectionTotalCost', checkForDecimalAndNull(RMCC * calculatePercentage(RejectionPercentage), initialConfiguration.NoOfDecimalForPrice))
          setRejectionObj({
            ...rejectionObj,
            RejectionApplicabilityId: applicability.value,
            RejectionApplicability: applicability.label,
            RejectionPercentage: RejectionPercentage,
            RejectionCost: RMCC,
            RejectionTotalCost: checkForDecimalAndNull(RMCC * calculatePercentage(RejectionPercentage), initialConfiguration.NoOfDecimalForPrice)
          })
          break;

        case 'BOP + CC':
          setValue('RejectionCost', checkForDecimalAndNull(BOPCC, initialConfiguration.NoOfDecimalForPrice))
          setValue('RejectionTotalCost', checkForDecimalAndNull(BOPCC * calculatePercentage(RejectionPercentage), initialConfiguration.NoOfDecimalForPrice))
          setRejectionObj({
            ...rejectionObj,
            RejectionApplicabilityId: applicability.value,
            RejectionApplicability: applicability.label,
            RejectionPercentage: RejectionPercentage,
            RejectionCost: BOPCC,
            RejectionTotalCost: checkForDecimalAndNull(BOPCC * calculatePercentage(RejectionPercentage), initialConfiguration.NoOfDecimalForPrice)
          })
          break;

        case 'Fixed':
          setValue('RejectionCost', '-')
          setValue('RejectionTotalCost', checkForDecimalAndNull(RejectionPercentage, initialConfiguration.NoOfDecimalForPrice))
          setRejectionObj({
            ...rejectionObj,
            RejectionApplicabilityId: applicability.value,
            RejectionApplicability: applicability.label,
            RejectionPercentage: RejectionPercentage,
            RejectionCost: '-',
            RejectionTotalCost: checkForDecimalAndNull(RejectionPercentage, initialConfiguration.NoOfDecimalForPrice)
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
    setOverheadObj({})
    setProfitObj({})
    setOverheadValues({}, true)
    setProfitValues({}, true)
    setRejectionObj({})
    setIsSurfaceTreatmentAdded(false)
    if (newValue && newValue !== '' && newValue.value !== undefined && costData.IsVendor !== undefined) {
      setModelType(newValue)
      const reqParams = {
        ModelTypeId: newValue.value,
        VendorId: costData.IsVendor ? costData.VendorId : EMPTY_GUID,
        IsVendor: costData.IsVendor,
        EffectiveDate: CostingEffectiveDate,
      }

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

          //setRejectionObj(Data.CostingRejectionDetail)
          // setIsSurfaceTreatmentAdded(false)
          dispatch(gridDataAdded(true))
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
      setValue('OverheadFixedCost', '-')
      setValue('OverheadFixedTotalCost', dataObj.IsOverheadFixedApplicable ? dataObj.OverheadFixedPercentage : '')
    }

    if (dataObj.IsOverheadCombined && IsAPIResponse === false) {
      setValue('OverheadPercentage', dataObj.IsOverheadCombined ? dataObj.OverheadPercentage : '')
      setValue('OverheadCombinedCost', headerCosts && headerCosts.NetTotalRMBOPCC)
      setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * calculatePercentage(dataObj.OverheadPercentage), initialConfiguration.NoOfDecimalForPrice))
    }

    if (dataObj.IsOverheadRMApplicable) {
      setValue('OverheadRMPercentage', dataObj.IsOverheadRMApplicable ? dataObj.OverheadRMPercentage : '')
      setValue('OverheadRMCost', headerCosts && headerCosts.NetRawMaterialsCost)
      setValue('OverheadRMTotalCost', checkForDecimalAndNull(headerCosts.NetRawMaterialsCost * calculatePercentage(dataObj.OverheadRMPercentage), initialConfiguration.NoOfDecimalForPrice))
    }

    if (dataObj.IsOverheadBOPApplicable) {
      setValue('OverheadBOPPercentage', dataObj.IsOverheadBOPApplicable ? dataObj.OverheadBOPPercentage : '')
      setValue('OverheadBOPCost', headerCosts && headerCosts.NetBoughtOutPartCost)
      setValue('OverheadBOPTotalCost', checkForDecimalAndNull(headerCosts.NetBoughtOutPartCost * calculatePercentage(dataObj.OverheadBOPPercentage), initialConfiguration.NoOfDecimalForPrice))
    }

    if (dataObj.IsOverheadCCApplicable) {
      setValue('OverheadCCPercentage', dataObj.IsOverheadCCApplicable ? dataObj.OverheadCCPercentage : '')
      setValue('OverheadCCCost', headerCosts && headerCosts.NetConversionCost)
      setValue('OverheadCCTotalCost', checkForDecimalAndNull(headerCosts.NetConversionCost * calculatePercentage(dataObj.OverheadCCPercentage), initialConfiguration.NoOfDecimalForPrice))
    }
  }

  /**
  * @method setProfitValues
  * @description  SET PROFIT VALUES IN FIXED, COMBINED, RM, CC AND FIXED
  */
  const setProfitValues = (dataObj, IsAPIResponse) => {

    if (dataObj.IsProfitFixedApplicable && IsAPIResponse === false) {
      setValue('ProfitFixedPercentage', dataObj.IsProfitFixedApplicable ? dataObj.ProfitFixedPercentage : '')
      setValue('ProfitFixedCost', '-')
      setValue('ProfitFixedTotalCost', dataObj.IsProfitFixedApplicable ? dataObj.ProfitFixedPercentage : '')
    }

    if (dataObj.IsProfitCombined && IsAPIResponse === false) {
      setValue('ProfitPercentage', dataObj.IsProfitCombined ? dataObj.ProfitPercentage : '')
      setValue('ProfitCombinedCost', checkForDecimalAndNull(headerCosts && headerCosts.NetTotalRMBOPCC, initialConfiguration.NoOfDecimalForPrice))
      //setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * calculatePercentage(dataObj.ProfitPercentage), initialConfiguration.NoOfDecimalForPrice))
    }

    if (dataObj.IsProfitRMApplicable) {
      setValue('ProfitRMPercentage', dataObj.IsProfitRMApplicable ? dataObj.ProfitRMPercentage : '')
      setValue('ProfitRMCost', headerCosts && headerCosts.NetRawMaterialsCost)
      setValue('ProfitRMTotalCost', checkForDecimalAndNull(headerCosts.NetRawMaterialsCost * calculatePercentage(dataObj.ProfitRMPercentage), initialConfiguration.NoOfDecimalForPrice))
    }

    if (dataObj.IsProfitBOPApplicable) {
      setValue('ProfitBOPPercentage', dataObj.IsProfitBOPApplicable ? dataObj.ProfitBOPPercentage : '')
      setValue('ProfitBOPCost', headerCosts && headerCosts.NetBoughtOutPartCost)
      setValue('ProfitBOPTotalCost', checkForDecimalAndNull(headerCosts.NetBoughtOutPartCost * calculatePercentage(dataObj.ProfitBOPPercentage), initialConfiguration.NoOfDecimalForPrice))
    }

    if (dataObj.IsProfitCCApplicable) {
      setValue('ProfitCCPercentage', dataObj.IsProfitCCApplicable ? dataObj.ProfitCCPercentage : '')
      setValue('ProfitCCCost', headerCosts && headerCosts.NetConversionCost)
      setValue('ProfitCCTotalCost', checkForDecimalAndNull(headerCosts.NetConversionCost * calculatePercentage(dataObj.ProfitCCPercentage), initialConfiguration.NoOfDecimalForPrice))
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
      setIsChangedApplicability(!IsChangedApplicability)
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
    dispatch(gridDataAdded(true))
  }

  useEffect(() => {
    if (IsInventoryApplicable === true) {
      const reqParams = {
        VendorId: costData.IsVendor ? costData.VendorId : EMPTY_GUID,
        IsVendor: costData.IsVendor
      }
      dispatch(getInventoryDataByHeads(reqParams, res => {
        if (res && res.data && res.data.Result) {
          let Data = res.data.Data;
          setValue('InterestRatePercentage', Data.InterestRate)
          setICCInterestRateId(Data.InterestRateId !== null ? Data.InterestRateId : EMPTY_GUID)
          setICCapplicability({ label: Data.ICCApplicability, value: Data.ICCApplicability })

          if (IsIncludedSurfaceInOverheadProfit) {
            setIsSurfaceTreatmentAdded(false)
            setTimeout(() => {
              IncludeSurfaceTreatmentCall()
            }, 200)
          } else {
            checkInventoryApplicability(Data.ICCApplicability)
          }

        } else if (res && res.status === 204) {
          setValue('InterestRatePercentage', '')
          setValue('InterestRateCost', '')
          setValue('NetICCTotal', '')
          checkInventoryApplicability('')
          setICCapplicability([])
        }

      }))
    } else {
      setICCapplicability([])
      props.setICCDetail(null, { BOMLevel: data.BOMLevel, PartNumber: data.PartNumber })
    }
  }, [IsInventoryApplicable])

  /**
   * @method handleICCApplicabilityChange
   * @description  USED TO HANDLE ICC APPLICABILITY CHANGE
   */
  const handleICCApplicabilityChange = (newValue) => {
    if (newValue && newValue !== '') {
      setICCapplicability(newValue)
      const reqParams = {
        Id: newValue.value,
        VendorId: costData.IsVendor ? costData.VendorId : EMPTY_GUID,
        IsVendor: costData.IsVendor
      }
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
            setICCInterestRateId(Data.InterestRateId !== null ? Data.InterestRateId : EMPTY_GUID)
            checkInventoryApplicability(newValue.label)
          }
        }
      }))
    } else {
      setICCapplicability([])
    }
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
    if (headerCosts !== undefined && Text !== '') {

      const RMBOP = headerCosts.NetRawMaterialsCost + headerCosts.NetBoughtOutPartCost;
      const RMCC = headerCosts.NetRawMaterialsCost + headerCosts.NetConversionCost;
      const InterestRatePercentage = getValues('InterestRatePercentage')

      switch (Text) {
        case 'RM':
          setValue('InterestRateCost', headerCosts.NetRawMaterialsCost)
          setValue('NetICCTotal', checkForDecimalAndNull(headerCosts.NetRawMaterialsCost * calculatePercentage(InterestRatePercentage), initialConfiguration.NoOfDecimalForPrice))
          break;

        case 'RM + CC':
          setValue('InterestRateCost', RMCC)
          setValue('NetICCTotal', checkForDecimalAndNull(RMCC * calculatePercentage(InterestRatePercentage), initialConfiguration.NoOfDecimalForPrice))
          break;

        case 'RM + BOP':
          setValue('InterestRateCost', RMBOP)
          setValue('NetICCTotal', checkForDecimalAndNull(RMBOP * calculatePercentage(InterestRatePercentage), initialConfiguration.NoOfDecimalForPrice))
          break;

        case 'RM + CC + BOP':
          setValue('InterestRateCost', headerCosts.NetTotalRMBOPCC)
          setValue('NetICCTotal', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * calculatePercentage(InterestRatePercentage), initialConfiguration.NoOfDecimalForPrice))
          break;

        case 'Fixed':
          setValue('InterestRateCost', '-')
          setValue('NetICCTotal', checkForDecimalAndNull(InterestRatePercentage, initialConfiguration.NoOfDecimalForPrice))
          break;

        case 'Annual ICC (%)':
          setValue('InterestRateCost', headerCosts.NetTotalRMBOPCC)
          setValue('NetICCTotal', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * calculatePercentage(InterestRatePercentage), initialConfiguration.NoOfDecimalForPrice))
          break;

        case 'Net Cost':
          setValue('InterestRateCost', headerCosts.NetTotalRMBOPCC)
          setValue('NetICCTotal', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * calculatePercentage(InterestRatePercentage), initialConfiguration.NoOfDecimalForPrice))
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
    dispatch(gridDataAdded(true))
  }

  useEffect(() => {
    if (IsPaymentTermsApplicable === true) {
      const reqParams = {
        VendorId: costData.IsVendor ? costData.VendorId : EMPTY_GUID,
        IsVendor: costData.IsVendor
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
      props.setPaymentTermsDetail(null, { BOMLevel: data.BOMLevel, PartNumber: data.PartNumber })
    }
  }, [IsPaymentTermsApplicable])

  /**
   * @method handlePaymentTermsApplicabilityChange
   * @description  USED TO HANDLE PAYMENT TERM APPLICABILITY CHANGE
   */
  const handlePaymentTermsApplicabilityChange = (newValue) => {
    if (newValue && newValue !== '') {
      setPaymentTermsApplicability(newValue)
      const reqParams = {
        VendorId: costData.IsVendor ? costData.VendorId : EMPTY_GUID,
        IsVendor: costData.IsVendor
      }
      dispatch(getPaymentTermsDataByHeads(reqParams, res => {
        if (res.status === 204) {
          setValue('RepaymentPeriodDays', '')
          setValue('RepaymentPeriodPercentage', '')
          setValue('RepaymentPeriodCost', '')
          checkPaymentTermApplicability('')
        } else if (res && res.data && res.data.Result) {
          let Data = res.data.Data;
          setValue('RepaymentPeriodDays', Data.RepaymentPeriod)
          setValue('RepaymentPeriodPercentage', Data.InterestRate !== null ? Data.InterestRate : 0)
          setPaymentTermInterestRateId(Data.InterestRateId !== EMPTY_GUID ? Data.InterestRateId : null)
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
    if (headerCosts !== undefined && Text !== '') {

      const RMBOP = headerCosts.NetRawMaterialsCost + headerCosts.NetBoughtOutPartCost;
      const RMCC = headerCosts.NetRawMaterialsCost + headerCosts.NetConversionCost;
      const RepaymentPeriodDays = getValues('RepaymentPeriodDays')
      const RepaymentPeriodPercentage = getValues('RepaymentPeriodPercentage')
      const RepaymentCost = (calculatePercentage(RepaymentPeriodPercentage) / 90) * RepaymentPeriodDays;

      switch (Text) {
        case 'RM':
          setValue('RepaymentPeriodCost', checkForDecimalAndNull(headerCosts.NetRawMaterialsCost * RepaymentCost, initialConfiguration.NoOfDecimalForPrice))
          break;

        case 'RM + CC':
          setValue('RepaymentPeriodCost', checkForDecimalAndNull(RMCC * RepaymentCost, initialConfiguration.NoOfDecimalForPrice))
          break;

        case 'RM + BOP':
          setValue('RepaymentPeriodCost', checkForDecimalAndNull(RMBOP * RepaymentCost, initialConfiguration.NoOfDecimalForPrice))
          break;

        case 'RM + CC + BOP':
          setValue('RepaymentPeriodCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * RepaymentCost, initialConfiguration.NoOfDecimalForPrice))
          break;

        case 'Fixed':
          setValue('RepaymentPeriodCost', checkForDecimalAndNull(RepaymentPeriodPercentage, initialConfiguration.NoOfDecimalForPrice))
          break;

        case 'Annual ICC (%)':
          setValue('RepaymentPeriodCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * RepaymentCost, initialConfiguration.NoOfDecimalForPrice))
          break;

        case 'Net Cost':
          setValue('RepaymentPeriodCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * RepaymentCost, initialConfiguration.NoOfDecimalForPrice))
          break;

        default:
          break;
      }
    }
  }

  /**
  * @method IncludeSurfaceTreatmentCall
  * @description INCLUDE SURFACE TREATMENT IN TO OVERHEAD AND PROFIT
  */
  const IncludeSurfaceTreatmentCall = () => {

    // START HERE ADD CC IN OVERHEAD
    if (IsIncludedSurfaceInOverheadProfit && IsSurfaceTreatmentAdded === false && overheadObj && overheadObj.IsOverheadCCApplicable) {

      const { OverheadCCPercentage } = overheadObj;
      setValue('OverheadCCCost', getValues('OverheadCCCost') + SurfaceTreatmentCost.NetSurfaceTreatmentCost)
      setValue('OverheadCCTotalCost', checkForDecimalAndNull((getValues('OverheadCCCost') * calculatePercentage(OverheadCCPercentage)), initialConfiguration.NoOfDecimalForPrice))
      setIsSurfaceTreatmentAdded(true)
      setOverheadObj({
        ...overheadObj,
        OverheadCCCost: getValues('OverheadCCCost'),
        OverheadCCTotalCost: checkForDecimalAndNull((getValues('OverheadCCCost') * calculatePercentage(OverheadCCPercentage)), initialConfiguration.NoOfDecimalForPrice),
      })

    } else if (!IsIncludedSurfaceInOverheadProfit && overheadObj && overheadObj.IsOverheadCCApplicable) {

      const { OverheadCCPercentage } = overheadObj;
      setValue('OverheadCCCost', headerCosts !== undefined ? headerCosts.NetConversionCost : 0)
      setValue('OverheadCCTotalCost', checkForDecimalAndNull((headerCosts !== undefined ? headerCosts.NetConversionCost : 0) * calculatePercentage(OverheadCCPercentage), initialConfiguration.NoOfDecimalForPrice))
      setIsSurfaceTreatmentAdded(false)
      setOverheadObj({
        ...overheadObj,
        OverheadCCCost: headerCosts !== undefined ? headerCosts.NetConversionCost : 0,
        OverheadCCTotalCost: checkForDecimalAndNull((headerCosts !== undefined ? headerCosts.NetConversionCost : 0) * calculatePercentage(OverheadCCPercentage), initialConfiguration.NoOfDecimalForPrice)
      })

      // END HERE ADD CC IN OVERHEAD
    }

    // START ADD CC IN PROFIT
    if (IsIncludedSurfaceInOverheadProfit && IsSurfaceTreatmentAdded === false && profitObj && profitObj.IsProfitCCApplicable) {

      const { ProfitCCPercentage } = profitObj;
      setValue('ProfitCCCost', getValues('ProfitCCCost') + SurfaceTreatmentCost.NetSurfaceTreatmentCost)
      setValue('ProfitCCTotalCost', checkForDecimalAndNull(getValues('ProfitCCCost') * calculatePercentage(ProfitCCPercentage), initialConfiguration.NoOfDecimalForPrice))
      setIsSurfaceTreatmentAdded(true)
      setProfitObj({
        ...profitObj,
        ProfitCCCost: getValues('ProfitCCCost'),
        ProfitCCTotalCost: checkForDecimalAndNull(getValues('ProfitCCCost') * calculatePercentage(ProfitCCPercentage), initialConfiguration.NoOfDecimalForPrice),
      })

    } else if (!IsIncludedSurfaceInOverheadProfit && profitObj && profitObj.IsProfitCCApplicable) {

      const { ProfitCCPercentage } = profitObj;
      setValue('ProfitCCCost', headerCosts !== undefined ? headerCosts.NetConversionCost : 0)
      setValue('ProfitCCTotalCost', checkForDecimalAndNull((headerCosts !== undefined ? headerCosts.NetConversionCost : 0) * calculatePercentage(ProfitCCPercentage), initialConfiguration.NoOfDecimalForPrice))
      setIsSurfaceTreatmentAdded(false)
      setProfitObj({
        ...profitObj,
        ProfitCCCost: headerCosts !== undefined ? headerCosts.NetConversionCost : 0,
        ProfitCCTotalCost: checkForDecimalAndNull((headerCosts !== undefined ? headerCosts.NetConversionCost : 0) * calculatePercentage(ProfitCCPercentage), initialConfiguration.NoOfDecimalForPrice),
      })
      // END HERE ADD CC IN PROFIT
    }

    // START ADD CC IN OVERHEAD COMBINED
    if (IsIncludedSurfaceInOverheadProfit && IsSurfaceTreatmentAdded === false && overheadObj && overheadObj.IsOverheadCombined) {
      const { OverheadApplicability, OverheadPercentage } = overheadObj;
      switch (OverheadApplicability) {
        case 'RM + CC + BOP':
          setValue('OverheadPercentage', OverheadPercentage)
          setValue('OverheadCombinedCost', headerCosts.NetTotalRMBOPCC + SurfaceTreatmentCost.NetSurfaceTreatmentCost)
          setValue('OverheadCombinedTotalCost', checkForDecimalAndNull((headerCosts.NetTotalRMBOPCC + SurfaceTreatmentCost.NetSurfaceTreatmentCost) * calculatePercentage(OverheadPercentage), initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(true)
          setOverheadObj({
            ...overheadObj,
            OverheadCombinedCost: getValues('OverheadCombinedCost'),
            OverheadCombinedTotalCost: checkForDecimalAndNull(getValues('OverheadCombinedCost') * calculatePercentage(OverheadPercentage), initialConfiguration.NoOfDecimalForPrice),
          })
          break;

        case 'RM + CC':
          const RMCC = headerCosts.NetRawMaterialsCost + headerCosts.NetConversionCost;
          setValue('OverheadPercentage', OverheadPercentage)
          setValue('OverheadCombinedCost', RMCC + SurfaceTreatmentCost.NetSurfaceTreatmentCost)
          setValue('OverheadCombinedTotalCost', checkForDecimalAndNull((RMCC + SurfaceTreatmentCost.NetSurfaceTreatmentCost) * calculatePercentage(OverheadPercentage), initialConfiguration.NoOfDecimalForPrice))
          setOverheadObj({
            ...overheadObj,
            OverheadCombinedCost: getValues('OverheadCombinedCost'),
            OverheadCombinedTotalCost: checkForDecimalAndNull(getValues('OverheadCombinedCost') * calculatePercentage(OverheadPercentage), initialConfiguration.NoOfDecimalForPrice),
          })
          break;

        case 'BOP + CC':
          const BOPCC = headerCosts.NetBoughtOutPartCost + headerCosts.NetConversionCost;
          setValue('OverheadPercentage', OverheadPercentage)
          setValue('OverheadCombinedCost', BOPCC + SurfaceTreatmentCost.NetSurfaceTreatmentCost)
          setValue('OverheadCombinedTotalCost', checkForDecimalAndNull((BOPCC + SurfaceTreatmentCost.NetSurfaceTreatmentCost) * calculatePercentage(OverheadPercentage), initialConfiguration.NoOfDecimalForPrice))
          setOverheadObj({
            ...overheadObj,
            OverheadCombinedCost: getValues('OverheadCombinedCost'),
            OverheadCombinedTotalCost: checkForDecimalAndNull(getValues('OverheadCombinedCost') * calculatePercentage(OverheadPercentage), initialConfiguration.NoOfDecimalForPrice),
          })
          break;

        default:
          break;
      }

    } else if (!IsIncludedSurfaceInOverheadProfit && overheadObj && overheadObj.IsOverheadCombined) {
      const { OverheadApplicability, OverheadPercentage } = overheadObj;
      switch (OverheadApplicability) {
        case 'RM + CC + BOP':
          setValue('OverheadPercentage', OverheadPercentage)
          setValue('OverheadCombinedCost', headerCosts.NetTotalRMBOPCC)
          setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * calculatePercentage(OverheadPercentage), initialConfiguration.NoOfDecimalForPrice))
          break;

        case 'RM + CC':
          const RMCC = headerCosts.NetRawMaterialsCost + headerCosts.NetConversionCost;
          setValue('OverheadPercentage', OverheadPercentage)
          setValue('OverheadCombinedCost', RMCC)
          setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(RMCC * calculatePercentage(OverheadPercentage), initialConfiguration.NoOfDecimalForPrice))
          break;

        case 'BOP + CC':
          const BOPCC = headerCosts.NetBoughtOutPartCost + headerCosts.NetConversionCost;
          setValue('OverheadPercentage', OverheadPercentage)
          setValue('OverheadCombinedCost', BOPCC)
          setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(BOPCC * calculatePercentage(OverheadPercentage), initialConfiguration.NoOfDecimalForPrice))
          break;

        default:
          break;
      }
      // END HERE ADD CC IN OVERHEAD COMBINED
    }

    // START ADD CC IN PROFIT COMBINED
    if (IsIncludedSurfaceInOverheadProfit && IsSurfaceTreatmentAdded === false && profitObj && profitObj.IsProfitCombined) {
      const { ProfitApplicability, ProfitPercentage } = profitObj;

      switch (ProfitApplicability) {
        case 'RM + CC + BOP':
          setValue('ProfitPercentage', ProfitPercentage)
          setValue('ProfitCombinedCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC + SurfaceTreatmentCost.NetSurfaceTreatmentCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('ProfitCombinedTotalCost', checkForDecimalAndNull((headerCosts.NetTotalRMBOPCC + SurfaceTreatmentCost.NetSurfaceTreatmentCost) * calculatePercentage(ProfitPercentage), initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(true)
          setProfitObj({
            ...profitObj,
            ProfitCombinedCost: getValues('ProfitCombinedCost'),
            ProfitCombinedTotalCost: checkForDecimalAndNull(getValues('ProfitCombinedCost') * calculatePercentage(ProfitPercentage), initialConfiguration.NoOfDecimalForPrice),
          })
          break;

        case 'RM + CC':
          const RMCC = headerCosts.NetRawMaterialsCost + headerCosts.NetConversionCost;
          setValue('ProfitPercentage', ProfitPercentage)
          setValue('ProfitCombinedCost', checkForDecimalAndNull(RMCC + SurfaceTreatmentCost.NetSurfaceTreatmentCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('ProfitCombinedTotalCost', checkForDecimalAndNull((RMCC + SurfaceTreatmentCost.NetSurfaceTreatmentCost) * calculatePercentage(ProfitPercentage), initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(true)
          setProfitObj({
            ...profitObj,
            ProfitCombinedCost: getValues('ProfitCombinedCost'),
            ProfitCombinedTotalCost: checkForDecimalAndNull(getValues('ProfitCombinedCost') * calculatePercentage(ProfitPercentage), initialConfiguration.NoOfDecimalForPrice),
          })
          break;

        case 'BOP + CC':
          const BOPCC = headerCosts.NetBoughtOutPartCost + headerCosts.NetConversionCost;
          setValue('ProfitPercentage', ProfitPercentage)
          setValue('ProfitCombinedCost', checkForDecimalAndNull(BOPCC + SurfaceTreatmentCost.NetSurfaceTreatmentCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(getValues('ProfitCombinedCost') * calculatePercentage(ProfitPercentage), initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(true)
          setProfitObj({
            ...profitObj,
            ProfitCombinedCost: getValues('ProfitCombinedCost'),
            ProfitCombinedTotalCost: checkForDecimalAndNull(getValues('ProfitCombinedCost') * calculatePercentage(ProfitPercentage), initialConfiguration.NoOfDecimalForPrice),
          })
          break;

        default:
          break;
      }

    } else if (!IsIncludedSurfaceInOverheadProfit && profitObj && profitObj.IsProfitCombined) {
      const { ProfitApplicability, ProfitPercentage } = profitObj;
      switch (ProfitApplicability) {
        case 'RM + CC + BOP':
          setValue('ProfitPercentage', ProfitPercentage)
          setValue('ProfitCombinedCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC, initialConfiguration.NoOfDecimalForPrice))
          setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(getValues('ProfitCombinedCost') * calculatePercentage(ProfitPercentage), initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(false)
          setProfitObj({
            ...profitObj,
            ProfitCombinedCost: getValues('ProfitCombinedCost'),
            ProfitCombinedTotalCost: checkForDecimalAndNull(getValues('ProfitCombinedCost') * calculatePercentage(ProfitPercentage), initialConfiguration.NoOfDecimalForPrice),
          })
          break;

        case 'RM + CC':
          const RMCC = headerCosts.NetRawMaterialsCost + headerCosts.NetConversionCost;
          setValue('ProfitPercentage', ProfitPercentage)
          setValue('ProfitCombinedCost', RMCC)
          setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(RMCC * calculatePercentage(ProfitPercentage), initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(false)
          setProfitObj({
            ...profitObj,
            ProfitCombinedCost: getValues('ProfitCombinedCost'),
            ProfitCombinedTotalCost: checkForDecimalAndNull(getValues('ProfitCombinedCost') * calculatePercentage(ProfitPercentage), initialConfiguration.NoOfDecimalForPrice),
          })
          break;

        case 'BOP + CC':
          const BOPCC = headerCosts.NetBoughtOutPartCost + headerCosts.NetConversionCost;
          setValue('ProfitPercentage', ProfitPercentage)
          setValue('ProfitCombinedCost', checkForDecimalAndNull(BOPCC, initialConfiguration.NoOfDecimalForPrice))
          setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(BOPCC * calculatePercentage(ProfitPercentage), initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(false)
          setProfitObj({
            ...profitObj,
            ProfitCombinedCost: getValues('ProfitCombinedCost'),
            ProfitCombinedTotalCost: checkForDecimalAndNull(getValues('ProfitCombinedCost') * calculatePercentage(ProfitPercentage), initialConfiguration.NoOfDecimalForPrice),
          })
          break;

        default:
          break;
      }
      // END HERE ADD CC IN PROFIT COMBINED
    }

    // START ADD CC IN REJECTION
    if (IsIncludedSurfaceInOverheadProfit && IsSurfaceTreatmentAdded === false && applicability && applicability.label !== '') {
      const RMCC = headerCosts.NetRawMaterialsCost + headerCosts.NetConversionCost;
      const BOPCC = headerCosts.NetBoughtOutPartCost + headerCosts.NetConversionCost;
      const RejectionPercentage = getValues('RejectionPercentage')

      switch (applicability.label) {

        case 'CC':
          setValue('RejectionCost', headerCosts.NetConversionCost + SurfaceTreatmentCost.NetSurfaceTreatmentCost)
          setValue('RejectionTotalCost', checkForDecimalAndNull(getValues('RejectionCost') * calculatePercentage(RejectionPercentage), initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(true)
          setRejectionObj({
            ...rejectionObj,
            RejectionPercentage: RejectionPercentage,
            RejectionCost: getValues('RejectionCost'),
            RejectionTotalCost: checkForDecimalAndNull(getValues('RejectionCost') * calculatePercentage(RejectionPercentage), initialConfiguration.NoOfDecimalForPrice)
          })
          break;

        case 'RM + CC + BOP':
          setValue('RejectionCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC + SurfaceTreatmentCost.NetSurfaceTreatmentCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('RejectionTotalCost', checkForDecimalAndNull(getValues('RejectionCost') * calculatePercentage(RejectionPercentage), initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(true)
          setRejectionObj({
            ...rejectionObj,
            RejectionPercentage: RejectionPercentage,
            RejectionCost: getValues('RejectionCost'),
            RejectionTotalCost: checkForDecimalAndNull(getValues('RejectionCost') * calculatePercentage(RejectionPercentage), initialConfiguration.NoOfDecimalForPrice)
          })
          break;

        case 'RM + CC':
          setValue('RejectionCost', checkForDecimalAndNull(RMCC + SurfaceTreatmentCost.NetSurfaceTreatmentCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('RejectionTotalCost', checkForDecimalAndNull(getValues('RejectionCost') * calculatePercentage(RejectionPercentage), initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(true)
          setRejectionObj({
            ...rejectionObj,
            RejectionPercentage: RejectionPercentage,
            RejectionCost: getValues('RejectionCost'),
            RejectionTotalCost: checkForDecimalAndNull(getValues('RejectionCost') * calculatePercentage(RejectionPercentage), initialConfiguration.NoOfDecimalForPrice)
          })
          break;

        case 'BOP + CC':
          setValue('RejectionCost', checkForDecimalAndNull(BOPCC + SurfaceTreatmentCost.NetSurfaceTreatmentCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('RejectionTotalCost', checkForDecimalAndNull(getValues('RejectionCost') * calculatePercentage(RejectionPercentage), initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(true)
          setRejectionObj({
            ...rejectionObj,
            RejectionPercentage: RejectionPercentage,
            RejectionCost: getValues('RejectionCost'),
            RejectionTotalCost: checkForDecimalAndNull(getValues('RejectionCost') * calculatePercentage(RejectionPercentage), initialConfiguration.NoOfDecimalForPrice)
          })
          break;

        default:
          break;
      }
      //}

    } else if (!IsIncludedSurfaceInOverheadProfit && applicability && applicability.label !== '') {
      const RMCC = headerCosts.NetRawMaterialsCost + headerCosts.NetConversionCost;
      const BOPCC = headerCosts.NetBoughtOutPartCost + headerCosts.NetConversionCost;
      const RejectionPercentage = getValues('RejectionPercentage')

      switch (applicability.label) {

        case 'CC':
          setValue('RejectionCost', headerCosts.NetConversionCost)
          setValue('RejectionTotalCost', checkForDecimalAndNull(getValues('RejectionCost') * calculatePercentage(RejectionPercentage), initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(false)
          setRejectionObj({
            ...rejectionObj,
            RejectionPercentage: RejectionPercentage,
            RejectionCost: getValues('RejectionCost'),
            RejectionTotalCost: checkForDecimalAndNull(getValues('RejectionCost') * calculatePercentage(RejectionPercentage), initialConfiguration.NoOfDecimalForPrice)
          })
          break;

        case 'RM + CC + BOP':
          setValue('RejectionCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC, initialConfiguration.NoOfDecimalForPrice))
          setValue('RejectionTotalCost', checkForDecimalAndNull(getValues('RejectionCost') * calculatePercentage(RejectionPercentage), initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(false)
          setRejectionObj({
            ...rejectionObj,
            RejectionPercentage: RejectionPercentage,
            RejectionCost: getValues('RejectionCost'),
            RejectionTotalCost: checkForDecimalAndNull(getValues('RejectionCost') * calculatePercentage(RejectionPercentage), initialConfiguration.NoOfDecimalForPrice)
          })
          break;

        case 'RM + CC':
          setValue('RejectionCost', checkForDecimalAndNull(RMCC, initialConfiguration.NoOfDecimalForPrice))
          setValue('RejectionTotalCost', checkForDecimalAndNull(getValues('RejectionCost') * calculatePercentage(RejectionPercentage), initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(false)
          setRejectionObj({
            ...rejectionObj,
            RejectionPercentage: RejectionPercentage,
            RejectionCost: getValues('RejectionCost'),
            RejectionTotalCost: checkForDecimalAndNull(getValues('RejectionCost') * calculatePercentage(RejectionPercentage), initialConfiguration.NoOfDecimalForPrice)
          })
          break;

        case 'BOP + CC':
          setValue('RejectionCost', checkForDecimalAndNull(BOPCC, initialConfiguration.NoOfDecimalForPrice))
          setValue('RejectionTotalCost', checkForDecimalAndNull(getValues('RejectionCost') * calculatePercentage(RejectionPercentage), initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(false)
          setRejectionObj({
            ...rejectionObj,
            RejectionPercentage: RejectionPercentage,
            RejectionCost: getValues('RejectionCost'),
            RejectionTotalCost: checkForDecimalAndNull(getValues('RejectionCost') * calculatePercentage(RejectionPercentage), initialConfiguration.NoOfDecimalForPrice)
          })
          break;

        default:
          break;
      }
      // END HERE ADD CC IN REJECTION
    }

    // START ADD CC IN ICC
    if (IsIncludedSurfaceInOverheadProfit && IsSurfaceTreatmentAdded === false && IsInventoryApplicable) {

      const RMBOP = headerCosts.NetRawMaterialsCost + headerCosts.NetBoughtOutPartCost;
      const RMCC = headerCosts.NetRawMaterialsCost + headerCosts.NetConversionCost;
      const InterestRatePercentage = getValues('InterestRatePercentage')

      switch (ICCapplicability.label) {
        case 'RM + CC':
          setValue('InterestRateCost', RMCC + SurfaceTreatmentCost.NetSurfaceTreatmentCost)
          setValue('NetICCTotal', checkForDecimalAndNull(getValues('InterestRateCost') * calculatePercentage(InterestRatePercentage), initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(true)
          break;

        case 'RM + CC + BOP':
          setValue('InterestRateCost', headerCosts.NetTotalRMBOPCC + SurfaceTreatmentCost.NetSurfaceTreatmentCost)
          setValue('NetICCTotal', checkForDecimalAndNull(getValues('InterestRateCost') * calculatePercentage(InterestRatePercentage), initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(true)
          break;

        case 'Annual ICC (%)':
          setValue('InterestRateCost', headerCosts.NetTotalRMBOPCC + SurfaceTreatmentCost.NetSurfaceTreatmentCost)
          setValue('NetICCTotal', checkForDecimalAndNull(getValues('InterestRateCost') * calculatePercentage(InterestRatePercentage), initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(true)
          break;

        case 'Net Cost':
          setValue('InterestRateCost', headerCosts.NetTotalRMBOPCC + SurfaceTreatmentCost.NetSurfaceTreatmentCost)
          setValue('NetICCTotal', checkForDecimalAndNull(getValues('InterestRateCost') * calculatePercentage(InterestRatePercentage), initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(true)
          break;

        default:
          break;
      }

    } else if (!IsIncludedSurfaceInOverheadProfit && IsInventoryApplicable) {

      const RMBOP = headerCosts.NetRawMaterialsCost + headerCosts.NetBoughtOutPartCost;
      const RMCC = headerCosts.NetRawMaterialsCost + headerCosts.NetConversionCost;
      const InterestRatePercentage = getValues('InterestRatePercentage')

      switch (Text) {
        case 'RM + CC':
          setValue('InterestRateCost', RMCC)
          setValue('NetICCTotal', checkForDecimalAndNull(RMCC * calculatePercentage(InterestRatePercentage), initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(false)
          break;

        case 'RM + CC + BOP':
          setValue('InterestRateCost', headerCosts.NetTotalRMBOPCC)
          setValue('NetICCTotal', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * calculatePercentage(InterestRatePercentage), initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(false)
          break;

        case 'Annual ICC (%)':
          setValue('InterestRateCost', headerCosts.NetTotalRMBOPCC)
          setValue('NetICCTotal', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * calculatePercentage(InterestRatePercentage), initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(false)
          break;

        case 'Net Cost':
          setValue('InterestRateCost', headerCosts.NetTotalRMBOPCC)
          setValue('NetICCTotal', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * calculatePercentage(InterestRatePercentage), initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(false)
          break;

        default:
          break;
      }
      // END HERE ADD CC IN ICC
    }

    // START ADD CC IN PAYMENT TERMS
    if (IsIncludedSurfaceInOverheadProfit && IsSurfaceTreatmentAdded === false && IsPaymentTermsApplicable) {

      const RMCC = headerCosts.NetRawMaterialsCost + headerCosts.NetConversionCost;
      const RepaymentPeriodDays = getValues('RepaymentPeriodDays')
      const RepaymentPeriodPercentage = getValues('RepaymentPeriodPercentage')
      const RepaymentCost = (calculatePercentage(RepaymentPeriodPercentage) / 90) * RepaymentPeriodDays;

      switch (Text) {

        case 'RM + CC':
          setValue('RepaymentPeriodCost', checkForDecimalAndNull((RMCC + SurfaceTreatmentCost.NetSurfaceTreatmentCost) * RepaymentCost, initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(true)
          break;

        case 'RM + CC + BOP':
          setValue('RepaymentPeriodCost', checkForDecimalAndNull((headerCosts.NetTotalRMBOPCC + SurfaceTreatmentCost.NetSurfaceTreatmentCost) * RepaymentCost, initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(true)
          break;

        case 'Annual ICC (%)':
          setValue('RepaymentPeriodCost', checkForDecimalAndNull((headerCosts.NetTotalRMBOPCC + SurfaceTreatmentCost.NetSurfaceTreatmentCost) * RepaymentCost, initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(true)
          break;

        case 'Net Cost':
          setValue('RepaymentPeriodCost', checkForDecimalAndNull((headerCosts.NetTotalRMBOPCC + SurfaceTreatmentCost.NetSurfaceTreatmentCost) * RepaymentCost, initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(true)
          break;

        default:
          break;
      }

    } else if (!IsIncludedSurfaceInOverheadProfit && IsPaymentTermsApplicable) {

      const RMCC = headerCosts.NetRawMaterialsCost + headerCosts.NetConversionCost;
      const RepaymentPeriodDays = getValues('RepaymentPeriodDays')
      const RepaymentPeriodPercentage = getValues('RepaymentPeriodPercentage')
      const RepaymentCost = (calculatePercentage(RepaymentPeriodPercentage) / 90) * RepaymentPeriodDays;

      switch (Text) {

        case 'RM + CC':
          setValue('RepaymentPeriodCost', checkForDecimalAndNull(RMCC * RepaymentCost, initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(false)
          break;

        case 'RM + CC + BOP':
          setValue('RepaymentPeriodCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * RepaymentCost, initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(false)
          break;

        case 'Annual ICC (%)':
          setValue('RepaymentPeriodCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * RepaymentCost, initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(false)
          break;

        case 'Net Cost':
          setValue('RepaymentPeriodCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * RepaymentCost, initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(false)
          break;

        default:
          break;
      }
      // END HERE ADD CC IN PAYMENT TERMS
    }
  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  const onSubmit = (values) => {
    props.saveCosting(values)
  }

  //console.log('counter', counter)
  counter++;

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
                  rules={{ required: false }}
                  register={register}
                  defaultValue={modelType.length !== 0 ? modelType : ''}
                  options={renderListing('ModelType')}
                  mandatory={false}
                  disabled={CostingViewMode ? true : false}
                  handleChange={handleModelTypeChange}
                  errors={errors.ModelType}
                />
              </Col>

              <Col md="3">
                <label>
                  {''}
                </label>
                <button type="button" className={'refresh-icon mt9 tooltip-n'} onClick={() => IncludeSurfaceTreatmentCall()}>
                  <span class="tooltiptext">Refresh to update Overhead and Profit cost</span>
                </button>
              </Col>

              <Col md="3">
                {''}
              </Col>

              <Col md="3" className="pl-0">
                <label>
                  {'Net Overhead & Profit'}
                </label>
                <input className="form-control" disabled value={checkForDecimalAndNull(checkForNull(data.CostingPartDetails.OverheadCost) + checkForNull(data.CostingPartDetails.ProfitCost), initialConfiguration.NoOfDecimalForPrice)} />
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
                      {`${overheadObj && overheadObj.IsOverheadFixedApplicable ? 'Fixed Cost' : 'Percentage (%)'}`}
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
                            // max: {
                            //   value: 100,
                            //   message: 'Percentage cannot be greater than 100'
                            // },
                          }}
                          handleChange={() => { }}
                          defaultValue={''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.OverheadFixedPercentage}
                          disabled={CostingViewMode ? true : false}
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
                      {`${profitObj && profitObj.IsProfitFixedApplicable ? 'Fixed Cost' : 'Percentage (%)'}`}
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
                            // max: {
                            //   value: 100,
                            //   message: 'Percentage cannot be greater than 100'
                            // },
                          }}
                          handleChange={() => { }}
                          defaultValue={''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.ProfitFixedPercentage}
                          disabled={CostingViewMode ? true : false}
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
                          {`${profitObj && profitObj.ProfitApplicability ? '(' + profitObj.ProfitApplicability + ')' : ''}`}
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
                  rules={{ required: false }}
                  register={register}
                  defaultValue={applicability.length !== 0 ? applicability : ''}
                  options={renderListing('Applicability')}
                  mandatory={false}
                  disabled={CostingViewMode ? true : false}
                  handleChange={handleApplicabilityChange}
                  errors={errors.Applicability}
                />
              </Col>
              <Col md="3">
                <NumberFieldHookForm
                  label={`Rejection ${applicability.label !== 'Fixed' ? '(%)' : ''}`}
                  name={'RejectionPercentage'}
                  Controller={Controller}
                  control={control}
                  register={register}
                  mandatory={false}
                  rules={{
                    required: false,
                    pattern: { value: /^\d*\.?\d*$/, message: 'Invalid Number.' },
                    max: { value: 100, message: 'Percentage cannot be greater than 100' },
                  }}
                  // handleChange={handleRejection}
                  handleChange={() => { }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  errors={errors.RejectionPercentage}
                  disabled={CostingViewMode ? true : false}
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
                    disabled={CostingViewMode ? true : false}
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
                    <label className="col-label">
                      {ICCapplicability.label}
                    </label>
                  </Col>
                  <Col md="3">
                    <NumberFieldHookForm
                      label={`Interest Rate ${ICCapplicability.label !== 'Fixed' ? '(%)' : ''}`}
                      name={'InterestRatePercentage'}
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
                    disabled={CostingViewMode ? true : false}
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
                    {/* <SearchableSelectHookForm
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
                    /> */}
                  </Col>
                  {paymentTermsApplicability.label !== 'Fixed' && <Col md="3">
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
                  </Col>}
                  <Col md="3">
                    <NumberFieldHookForm
                      label={`Interest Rate${paymentTermsApplicability.label !== 'Fixed' ? '(%)' : ''}`}
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
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.RepaymentPeriodPercentage}
                      disabled={paymentTermsApplicability.label !== 'Fixed' ? true : false}
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
                </>
              </Row>
            }


            <Row className="sf-btn-footer no-gutters justify-content-between costing-overhead-profit-footer">
              <div className="col-sm-12 text-right bluefooter-butn">
                {!CostingViewMode && <button
                  type={'submit'}
                  className="submit-button mr5 save-btn">
                  <div className={'check-icon'}><img src={require('../../../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
                  {'Save'}
                </button>}
              </div>
            </Row>
          </form>
        </div>
      </div>

    </ >
  );
}

export default React.memo(OverheadProfit);