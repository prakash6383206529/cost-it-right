import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller, useWatch, } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Row, } from 'reactstrap';
import { NumberFieldHookForm, SearchableSelectHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs';
import { calculatePercentage, checkForDecimalAndNull, checkForNull, CheckIsCostingDateSelected, } from '../../../../../helper';
import { fetchModelTypeAPI, fetchCostingHeadsAPI, getICCAppliSelectListKeyValue, getPaymentTermsAppliSelectListKeyValue } from '../../../../../actions/Common';
import { getOverheadProfitDataByModelType, getInventoryDataByHeads, getPaymentTermsDataByHeads, gridDataAdded, } from '../../../actions/Costing';
import Switch from "react-switch";
import { costingInfoContext, netHeadCostContext, SurfaceCostContext } from '../../CostingDetailStepTwo';
import { EMPTY_GUID } from '../../../../../config/constants';
import { ViewCostingContext } from '../../CostingDetails';
import TooltipCustom from '../../../../common/Tooltip';

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

  const { register, handleSubmit, control, setValue, getValues, formState: { errors } } = useForm({
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
  const { CostingEffectiveDate, CostingDataList, IsIncludedSurfaceInOverheadProfit, RMCCutOffObj } = useSelector(state => state.costing)

  const [overheadObj, setOverheadObj] = useState(CostingOverheadDetail)
  const [profitObj, setProfitObj] = useState(CostingProfitDetail)
  const [rejectionObj, setRejectionObj] = useState(CostingRejectionDetail)
  const [InventoryObj, setInventoryObj] = useState(ICCApplicabilityDetail)
  const [PaymentTermObj, setPaymentTermObj] = useState(PaymentTermDetail)

  const [modelType, setModelType] = useState(data.CostingPartDetails && data.CostingPartDetails.ModelType !== null ? { label: data.CostingPartDetails.ModelType, value: data.CostingPartDetails.ModelTypeId } : [])

  const [applicability, setApplicability] = useState(CostingRejectionDetail && CostingRejectionDetail.RejectionApplicability !== null ? { label: CostingRejectionDetail.RejectionApplicability, value: CostingRejectionDetail.RejectionApplicabilityId } : [])
  const [IsChangedApplicability, setIsChangedApplicability] = useState(false)

  const [IsInventoryApplicable, setIsInventoryApplicable] = useState(CostingInterestRateDetail && CostingInterestRateDetail.IsInventoryCarringCost ? true : false)
  const [ICCapplicability, setICCapplicability] = useState(ICCApplicabilityDetail !== undefined ? { label: ICCApplicabilityDetail.ICCApplicability, value: ICCApplicabilityDetail.ICCApplicability } : {})

  const [ICCInterestRateId, setICCInterestRateId] = useState(ICCApplicabilityDetail !== undefined ? ICCApplicabilityDetail.InterestRateId : '')

  const [IsPaymentTermsApplicable, setIsPaymentTermsApplicable] = useState(CostingInterestRateDetail && CostingInterestRateDetail.NetPaymentTermCost === 0 ? false : true)
  const [paymentTermsApplicability, setPaymentTermsApplicability] = useState(PaymentTermDetail !== undefined ? { label: PaymentTermDetail.PaymentTermApplicability, value: PaymentTermDetail.PaymentTermApplicability } : [])
  const [PaymentTermInterestRateId, setPaymentTermInterestRateId] = useState(PaymentTermDetail !== undefined ? PaymentTermDetail.InterestRateId : '')

  const [IsSurfaceTreatmentAdded, setIsSurfaceTreatmentAdded] = useState(false)

  //INITIAL CALLED EFFECT TO SET VALUES
  useEffect(() => {
    UpdateForm()

    if (data.CostingPartDetails && data.CostingPartDetails.ModelTypeId !== null) {
      handleModelTypeChange({ label: data.CostingPartDetails.ModelType, value: data.CostingPartDetails.ModelTypeId }, false)
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

  useEffect(() => {
    setIsSurfaceTreatmentAdded(false)
    IncludeSurfaceTreatmentCall()
  }, [SurfaceTreatmentCost.NetSurfaceTreatmentCost])

  // THIS EFFECT INVOKED WHEN RMC CUTOFF VALUE CHANGED ON RMCC TAB
  useEffect(() => {
    UpdateForm()
    setIsSurfaceTreatmentAdded(false)
    IncludeSurfaceTreatmentCall()
  }, [RMCCutOffObj])

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
      handleModelTypeChange(modelType, false)
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

  const overheadFixedFieldValues = useWatch({
    control,
    name: 'OverheadFixedPercentage',
  });

  const interestRateValues = useWatch({
    control,
    name: ['InterestRatePercentage',],
  });

  const profitFixedFieldValues = useWatch({
    control,
    name: 'ProfitFixedPercentage',
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

      if (!CostingViewMode) {
        props.setOverheadDetail({ overheadObj: tempObj, profitObj: profitTempObj, modelType: modelType }, { BOMLevel: data.BOMLevel, PartNumber: data.PartNumber })
      }
    }, 500)

  }, [overheadObj, profitObj]);

  useEffect(() => {
    checkRejectionApplicability(applicability.label)
    setTimeout(() => {
      let tempObj = {
        "RejectionApplicabilityId": applicability ? applicability.value : '',
        "RejectionApplicability": applicability ? applicability.label : '',
        "RejectionPercentage": applicability ? getValues('RejectionPercentage') : '',
        "RejectionCost": applicability ? getValues('RejectionCost') : '',
        "RejectionTotalCost": applicability ? getValues('RejectionTotalCost') : '',
        "IsSurfaceTreatmentApplicable": true,
      }

      if (!CostingViewMode) {
        props.setRejectionDetail(tempObj, { BOMLevel: data.BOMLevel, PartNumber: data.PartNumber })
      }
    }, 200)

  }, [rejectionFieldValues]);

  const ICCFieldValues = useWatch({
    control,
    name: ['ICCApplicability',],
  });

  useEffect(() => {
    checkInventoryApplicability(ICCapplicability?.label)

    setTimeout(() => {
      let tempObj = {
        "InterestRateId": ICCapplicability.label !== 'Fixed' ? (ICCApplicabilityDetail ? ICCInterestRateId : '') : null,
        "IccDetailId": InventoryObj ? InventoryObj.InterestRateId : '',
        "ICCApplicability": Object.keys(ICCapplicability).length > 0 ? ICCapplicability.label : '',
        "CostApplicability": IsInventoryApplicable ? getValues('InterestRateCost') : '',
        "InterestRate": IsInventoryApplicable ? getValues('InterestRatePercentage') : '',
        "NetCost": IsInventoryApplicable ? getValues('NetICCTotal') : '',
        "EffectiveDate": "",
      }

      if (!CostingViewMode) {
        props.setICCDetail(tempObj, { BOMLevel: data.BOMLevel, PartNumber: data.PartNumber })
      }
    }, 200)
  }, [interestRateValues, IsIncludedSurfaceInOverheadProfit, ICCapplicability]);

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
        "PaymentTermApplicability": Object.keys(paymentTermsApplicability).length > 0 ? paymentTermsApplicability.label : '',
        "RepaymentPeriod": IsPaymentTermsApplicable ? getValues('RepaymentPeriodDays') : '',
        "InterestRate": IsPaymentTermsApplicable ? getValues('RepaymentPeriodPercentage') : '',
        "NetCost": IsPaymentTermsApplicable ? getValues('RepaymentPeriodCost') : '',
        "EffectiveDate": ""
      }

      if (!CostingViewMode) {
        props.setPaymentTermsDetail(tempObj, { BOMLevel: data.BOMLevel, PartNumber: data.PartNumber })
      }
    }, 200)
  }, [PaymentTermsFieldValues, PaymentTermsFixedFieldValues, paymentTermsApplicability]);

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
  }, [overheadFixedFieldValues, profitFixedFieldValues]);

  const modelTypes = useSelector(state => state.comman.modelTypes)
  const costingHead = useSelector(state => state.comman.costingHead)
  const iccApplicabilitySelectList = useSelector(state => state.comman.iccApplicabilitySelectList)
  const paymentTermsSelectList = useSelector(state => state.comman.paymentTermsSelectList)

  /**
  * @method calculateOverheadFixedTotalCost
  * @description CALCULATE OVERHEAD FIXED TOTAL COST
  */
  const calculateOverheadFixedTotalCost = () => {
    if (headerCosts !== undefined && overheadFixedFieldValues !== undefined && overheadObj && overheadObj.IsOverheadFixedApplicable) {

      setValue('OverheadFixedCost', '-')
      setValue('OverheadFixedTotalCost', checkForDecimalAndNull(overheadFixedFieldValues, initialConfiguration.NoOfDecimalForPrice))
      setOverheadObj({
        ...overheadObj,
        OverheadFixedPercentage: overheadFixedFieldValues,
        OverheadFixedCost: '-',
        OverheadFixedTotalCost: checkForDecimalAndNull(overheadFixedFieldValues, initialConfiguration.NoOfDecimalForPrice),
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
    const { IsCutOffApplicable, CutOffRMC } = RMCCutOffObj;
    switch (OverheadCombinedText) {
      case 'RM + CC + BOP':
        setValue('OverheadPercentage', OverheadPercentage)
        //setValue('OverheadCombinedCost', headerCosts.NetTotalRMBOPCC)
        //setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * calculatePercentage(OverheadPercentage), initialConfiguration.NoOfDecimalForPrice))
        break;

      case 'RM + BOP':
        const RMBOP = (IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost) + headerCosts.NetBoughtOutPartCost;
        setValue('OverheadPercentage', OverheadPercentage)
        setValue('OverheadCombinedCost', RMBOP)
        setValue('OverheadCombinedTotalCost', checkForDecimalAndNull((RMBOP * calculatePercentage(OverheadPercentage)), initialConfiguration.NoOfDecimalForPrice))
        break;

      case 'RM + CC':
        const RMCC = headerCosts.NetRawMaterialsCost + headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal
          ;
        setValue('OverheadPercentage', OverheadPercentage)
        //setValue('OverheadCombinedCost', RMCC)
        //setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(RMCC * calculatePercentage(OverheadPercentage), initialConfiguration.NoOfDecimalForPrice))
        break;

      case 'BOP + CC':
        const BOPCC = headerCosts.NetBoughtOutPartCost + headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal;
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
      const { IsCutOffApplicable, CutOffRMC } = RMCCutOffObj;
      setValue('OverheadRMPercentage', OverheadRMPercentage)
      setValue('OverheadRMCost', IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost)
      setValue('OverheadRMTotalCost', checkForDecimalAndNull(((IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost) * calculatePercentage(OverheadRMPercentage)), initialConfiguration.NoOfDecimalForPrice))
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
      setValue('OverheadBOPTotalCost', checkForDecimalAndNull((headerCosts.NetBoughtOutPartCost * calculatePercentage(OverheadBOPPercentage)), initialConfiguration.NoOfDecimalForPrice))
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
    if (headerCosts !== undefined && profitFixedFieldValues !== undefined && profitObj && profitObj.IsProfitFixedApplicable) {
      setValue('ProfitFixedCost', '-')
      setValue('ProfitFixedTotalCost', checkForDecimalAndNull(profitFixedFieldValues, initialConfiguration.NoOfDecimalForPrice))
      setProfitObj({
        ...profitObj,
        ProfitFixedPercentage: profitFixedFieldValues,
        ProfitFixedCost: '-',
        ProfitFixedTotalCost: checkForDecimalAndNull(profitFixedFieldValues, initialConfiguration.NoOfDecimalForPrice),
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
    const { IsCutOffApplicable, CutOffRMC } = RMCCutOffObj;

    switch (ProfitCombinedText) {
      case 'RM + CC + BOP':
        setValue('ProfitPercentage', ProfitPercentage)
        //setValue('ProfitCombinedCost', headerCosts.NetTotalRMBOPCC)
        //setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * calculatePercentage(ProfitPercentage), initialConfiguration.NoOfDecimalForPrice))
        break;

      case 'RM + BOP':
        const RMBOP = (IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost) + headerCosts.NetBoughtOutPartCost;
        setValue('ProfitPercentage', ProfitPercentage)
        setValue('ProfitCombinedCost', checkForDecimalAndNull(RMBOP, initialConfiguration.NoOfDecimalForPrice))
        setValue('ProfitCombinedTotalCost', checkForDecimalAndNull((RMBOP * calculatePercentage(ProfitPercentage)), initialConfiguration.NoOfDecimalForPrice))
        break;

      case 'RM + CC':
        const RMCC = (IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost) + headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal;
        setValue('ProfitPercentage', ProfitPercentage)
        //setValue('ProfitCombinedCost', checkForDecimalAndNull(RMCC, initialConfiguration.NoOfDecimalForPrice))
        //setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(RMCC * calculatePercentage(ProfitPercentage), initialConfiguration.NoOfDecimalForPrice))
        break;

      case 'BOP + CC':
        const BOPCC = headerCosts.NetBoughtOutPartCost + headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal;
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
      const { IsCutOffApplicable, CutOffRMC } = RMCCutOffObj;
      setValue('ProfitRMPercentage', ProfitRMPercentage)
      setValue('ProfitRMCost', IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost)
      setValue('ProfitRMTotalCost', checkForDecimalAndNull(((IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost) * calculatePercentage(ProfitRMPercentage)), initialConfiguration.NoOfDecimalForPrice))
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
      setValue('ProfitBOPTotalCost', checkForDecimalAndNull((headerCosts.NetBoughtOutPartCost * calculatePercentage(ProfitBOPPercentage)), initialConfiguration.NoOfDecimalForPrice))
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
      const { IsCutOffApplicable, CutOffRMC } = RMCCutOffObj;
      const RMBOPCC = headerCosts.NetBoughtOutPartCost + headerCosts.NetRawMaterialsCost + headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal
      const CutOffRMBOPCCTotal = IsCutOffApplicable && headerCosts ? CutOffRMC + headerCosts.NetBoughtOutPartCost + headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal : RMBOPCC;

      const RMBOP = headerCosts.NetRawMaterialsCost + headerCosts.NetBoughtOutPartCost;
      const RMCC = headerCosts.NetRawMaterialsCost + headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal;
      const BOPCC = headerCosts.NetBoughtOutPartCost + headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal;
      const RejectionPercentage = getValues('RejectionPercentage')

      switch (Text) {
        case 'RM':
          setValue('RejectionCost', headerCosts.NetRawMaterialsCost)
          setValue('RejectionTotalCost', checkForDecimalAndNull((headerCosts.NetRawMaterialsCost * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice))
          setRejectionObj({
            ...rejectionObj,
            RejectionApplicabilityId: applicability.value,
            RejectionApplicability: applicability.label,
            RejectionPercentage: RejectionPercentage,
            RejectionCost: headerCosts.NetRawMaterialsCost,
            RejectionTotalCost: checkForDecimalAndNull((headerCosts.NetRawMaterialsCost * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice)
          })
          break;

        case 'BOP':
          setValue('RejectionCost', headerCosts.NetBoughtOutPartCost)
          setValue('RejectionTotalCost', checkForDecimalAndNull((headerCosts.NetBoughtOutPartCost * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice))
          setRejectionObj({
            ...rejectionObj,
            RejectionApplicabilityId: applicability.value,
            RejectionApplicability: applicability.label,
            RejectionPercentage: RejectionPercentage,
            RejectionCost: headerCosts.NetBoughtOutPartCost,
            RejectionTotalCost: checkForDecimalAndNull((headerCosts.NetBoughtOutPartCost * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice)
          })
          break;

        case 'CC':
          setValue('RejectionCost', headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal)
          setValue('RejectionTotalCost', checkForDecimalAndNull(((headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal) * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice))
          setRejectionObj({
            ...rejectionObj,
            RejectionApplicabilityId: applicability.value,
            RejectionApplicability: applicability.label,
            RejectionPercentage: RejectionPercentage,
            RejectionCost: headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal,
            RejectionTotalCost: checkForDecimalAndNull(((headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal) * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice)
          })
          break;

        case 'RM + CC + BOP':
          setValue('RejectionCost', checkForDecimalAndNull(CutOffRMBOPCCTotal, initialConfiguration.NoOfDecimalForPrice))
          setValue('RejectionTotalCost', checkForDecimalAndNull((CutOffRMBOPCCTotal * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice))
          setRejectionObj({
            ...rejectionObj,
            RejectionApplicabilityId: applicability.value,
            RejectionApplicability: applicability.label,
            RejectionPercentage: RejectionPercentage,
            RejectionCost: CutOffRMBOPCCTotal,
            RejectionTotalCost: checkForDecimalAndNull((CutOffRMBOPCCTotal * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice)
          })
          break;

        case 'RM + BOP':
          setValue('RejectionCost', checkForDecimalAndNull(RMBOP, initialConfiguration.NoOfDecimalForPrice))
          setValue('RejectionTotalCost', checkForDecimalAndNull((RMBOP * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice))
          setRejectionObj({
            ...rejectionObj,
            RejectionApplicabilityId: applicability.value,
            RejectionApplicability: applicability.label,
            RejectionPercentage: RejectionPercentage,
            RejectionCost: RMBOP,
            RejectionTotalCost: checkForDecimalAndNull((RMBOP * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice)
          })
          break;

        case 'RM + CC':
          setValue('RejectionCost', checkForDecimalAndNull(RMCC, initialConfiguration.NoOfDecimalForPrice))
          setValue('RejectionTotalCost', checkForDecimalAndNull((RMCC * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice))
          setRejectionObj({
            ...rejectionObj,
            RejectionApplicabilityId: applicability.value,
            RejectionApplicability: applicability.label,
            RejectionPercentage: RejectionPercentage,
            RejectionCost: RMCC,
            RejectionTotalCost: checkForDecimalAndNull((RMCC * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice)
          })
          break;

        case 'BOP + CC':
          setValue('RejectionCost', checkForDecimalAndNull(BOPCC, initialConfiguration.NoOfDecimalForPrice))
          setValue('RejectionTotalCost', checkForDecimalAndNull((BOPCC * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice))
          setRejectionObj({
            ...rejectionObj,
            RejectionApplicabilityId: applicability.value,
            RejectionApplicability: applicability.label,
            RejectionPercentage: RejectionPercentage,
            RejectionCost: BOPCC,
            RejectionTotalCost: checkForDecimalAndNull((BOPCC * calculatePercentage(RejectionPercentage)), initialConfiguration.NoOfDecimalForPrice)
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
  const handleModelTypeChange = (newValue, IsDropdownClicked) => {
    if (IsDropdownClicked) {
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
  }

  /**
  * @method setOverheadValues
  * @description  SET OVERHEAD VALUES IN FIXED, COMBINED, RM, CC AND BOP
  * @description IsAPIResponse, USED TO SET FIXED VALUE IN GET ON INITIAL LOAD API CALL
  */
  const setOverheadValues = (dataObj, IsAPIResponse) => {
    const { IsCutOffApplicable, CutOffRMC } = RMCCutOffObj;

    if (dataObj.IsOverheadFixedApplicable && IsAPIResponse === false) {

      setValue('OverheadFixedPercentage', dataObj.IsOverheadFixedApplicable ? dataObj.OverheadFixedPercentage : '')
      setValue('OverheadFixedCost', '-')
      setValue('OverheadFixedTotalCost', dataObj.IsOverheadFixedApplicable ? dataObj.OverheadFixedPercentage : '')
      setOverheadObj({
        ...overheadObj,
        OverheadFixedPercentage: getValues('OverheadFixedPercentage'),
        // OverheadFixedCost: '-',
        OverheadFixedTotalCost: checkForDecimalAndNull(getValues('OverheadFixedPercentage'), initialConfiguration.NoOfDecimalForPrice),
      })
    }

    if (dataObj.IsOverheadCombined && IsAPIResponse === false) {
      const RMBOPCC = headerCosts.NetBoughtOutPartCost + headerCosts.NetRawMaterialsCost + headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal
      const CutOffRMBOPCCTotal = IsCutOffApplicable && headerCosts ? CutOffRMC + headerCosts.NetBoughtOutPartCost + (headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal) : RMBOPCC; //NEED TO ASK FOR YHIS PART
      setValue('OverheadPercentage', dataObj.IsOverheadCombined ? dataObj.OverheadPercentage : '')
      setValue('OverheadCombinedCost', headerCosts && CutOffRMBOPCCTotal)
      setValue('OverheadCombinedTotalCost', checkForDecimalAndNull((CutOffRMBOPCCTotal * calculatePercentage(dataObj.OverheadPercentage)), initialConfiguration.NoOfDecimalForPrice))
    }

    if (dataObj.IsOverheadRMApplicable) {
      setValue('OverheadRMPercentage', dataObj.IsOverheadRMApplicable ? dataObj.OverheadRMPercentage : '')
      setValue('OverheadRMCost', headerCosts && IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost)
      setValue('OverheadRMTotalCost', checkForDecimalAndNull(((IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost) * calculatePercentage(dataObj.OverheadRMPercentage)), initialConfiguration.NoOfDecimalForPrice))
    }

    if (dataObj.IsOverheadBOPApplicable) {
      setValue('OverheadBOPPercentage', dataObj.IsOverheadBOPApplicable ? dataObj.OverheadBOPPercentage : '')
      setValue('OverheadBOPCost', headerCosts && headerCosts.NetBoughtOutPartCost)
      setValue('OverheadBOPTotalCost', checkForDecimalAndNull((headerCosts.NetBoughtOutPartCost * calculatePercentage(dataObj.OverheadBOPPercentage)), initialConfiguration.NoOfDecimalForPrice))
    }

    if (dataObj.IsOverheadCCApplicable) {
      setValue('OverheadCCPercentage', dataObj.IsOverheadCCApplicable ? dataObj.OverheadCCPercentage : '')
      setValue('OverheadCCCost', headerCosts && (headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal))
      setValue('OverheadCCTotalCost', checkForDecimalAndNull(((headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal) * calculatePercentage(dataObj.OverheadCCPercentage)), initialConfiguration.NoOfDecimalForPrice))
    }
  }

  /**
  * @method setProfitValues
  * @description  SET PROFIT VALUES IN FIXED, COMBINED, RM, CC AND FIXED
  */
  const setProfitValues = (dataObj, IsAPIResponse) => {
    const { IsCutOffApplicable, CutOffRMC } = RMCCutOffObj;
    const RMBOPCC = headerCosts.NetRawMaterialsCost + headerCosts.NetBoughtOutPartCost + headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal
    const CutOffRMBOPCCTotal = IsCutOffApplicable && headerCosts ? CutOffRMC + headerCosts.NetBoughtOutPartCost + headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal : RMBOPCC; //NEED TO ASK HERE ALSO

    if (dataObj.IsProfitFixedApplicable && IsAPIResponse === false) {
      setValue('ProfitFixedPercentage', dataObj.IsProfitFixedApplicable ? dataObj.ProfitFixedPercentage : '')
      setValue('ProfitFixedCost', '-')
      setValue('ProfitFixedTotalCost', dataObj.IsProfitFixedApplicable ? dataObj.ProfitFixedPercentage : '')
    }

    if (dataObj.IsProfitCombined && IsAPIResponse === false) {
      setValue('ProfitPercentage', dataObj.IsProfitCombined ? dataObj.ProfitPercentage : '')
      setValue('ProfitCombinedCost', checkForDecimalAndNull(headerCosts && CutOffRMBOPCCTotal, initialConfiguration.NoOfDecimalForPrice))
      //setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * calculatePercentage(dataObj.ProfitPercentage), initialConfiguration.NoOfDecimalForPrice))
    }

    if (dataObj.IsProfitRMApplicable) {

      setValue('ProfitRMPercentage', dataObj.IsProfitRMApplicable ? dataObj.ProfitRMPercentage : '')
      setValue('ProfitRMCost', headerCosts && IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost)
      setValue('ProfitRMTotalCost', checkForDecimalAndNull(((IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost) * calculatePercentage(dataObj.ProfitRMPercentage)), initialConfiguration.NoOfDecimalForPrice))
    }

    if (dataObj.IsProfitBOPApplicable) {
      setValue('ProfitBOPPercentage', dataObj.IsProfitBOPApplicable ? dataObj.ProfitBOPPercentage : '')
      setValue('ProfitBOPCost', headerCosts && headerCosts.NetBoughtOutPartCost)
      setValue('ProfitBOPTotalCost', checkForDecimalAndNull((headerCosts.NetBoughtOutPartCost * calculatePercentage(dataObj.ProfitBOPPercentage)), initialConfiguration.NoOfDecimalForPrice))
    }

    if (dataObj.IsProfitCCApplicable) {
      setValue('ProfitCCPercentage', dataObj.IsProfitCCApplicable ? dataObj.ProfitCCPercentage : '')
      setValue('ProfitCCCost', headerCosts && (headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal))
      setValue('ProfitCCTotalCost', checkForDecimalAndNull(((headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal) * calculatePercentage(dataObj.ProfitCCPercentage)), initialConfiguration.NoOfDecimalForPrice))
    }
  }

  /**
    * @method handleApplicabilityChange
    * @description  USED TO HANDLE APPLICABILITY CHANGE
    */
  const handleApplicabilityChange = (newValue) => {
    if (newValue && newValue !== '') {
      setValue('RejectionPercentage', '')
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
          setInventoryObj(Data)
          checkInventoryApplicability(Data.ICCApplicability)

        } else if (res && res.status === 204) {
          setValue('InterestRatePercentage', '')
          setValue('InterestRateCost', '')
          setValue('NetICCTotal', '')
          checkInventoryApplicability('')
          setICCapplicability([])
          setInventoryObj({})
        }

      }))
    } else {
      setICCapplicability([])
      if (!CostingViewMode) {
        props.setICCDetail(null, { BOMLevel: data.BOMLevel, PartNumber: data.PartNumber })
      }
    }
  }, [IsInventoryApplicable])

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

      const RMBOPCC = headerCosts.NetRawMaterialsCost + headerCosts.NetBoughtOutPartCost + headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal
      const RMBOP = headerCosts.NetRawMaterialsCost + headerCosts.NetBoughtOutPartCost;
      const RMCC = headerCosts.NetRawMaterialsCost + headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal;
      const InterestRatePercentage = getValues('InterestRatePercentage')

      switch (Text) {
        case 'RM':
          setValue('InterestRateCost', headerCosts.NetRawMaterialsCost)
          setValue('NetICCTotal', checkForDecimalAndNull((headerCosts.NetRawMaterialsCost * calculatePercentage(InterestRatePercentage)), initialConfiguration.NoOfDecimalForPrice))
          break;

        case 'RM + CC':
          setValue('InterestRateCost', RMCC)
          setValue('NetICCTotal', checkForDecimalAndNull((RMCC * calculatePercentage(InterestRatePercentage)), initialConfiguration.NoOfDecimalForPrice))
          break;

        case 'RM + BOP':
          setValue('InterestRateCost', RMBOP)
          setValue('NetICCTotal', checkForDecimalAndNull((RMBOP * calculatePercentage(InterestRatePercentage)), initialConfiguration.NoOfDecimalForPrice))
          break;

        case 'RM + CC + BOP':
          setValue('InterestRateCost', (RMBOPCC)) //NEED TO ASK HERE ALSO
          setValue('NetICCTotal', checkForDecimalAndNull((RMBOPCC * calculatePercentage(InterestRatePercentage)), initialConfiguration.NoOfDecimalForPrice))
          break;

        case 'Fixed':
          setValue('InterestRateCost', '-')
          setValue('NetICCTotal', checkForDecimalAndNull(InterestRatePercentage, initialConfiguration.NoOfDecimalForPrice))
          break;

        case 'Annual ICC (%)':
          setValue('InterestRateCost', RMBOPCC) // NEED TO ASK HERE ALSO
          setValue('NetICCTotal', checkForDecimalAndNull((RMBOPCC * calculatePercentage(InterestRatePercentage)), initialConfiguration.NoOfDecimalForPrice))
          break;

        case 'Net Cost':
          setValue('InterestRateCost', RMBOPCC) //NEED TO ASK HERE ALSO
          setValue('NetICCTotal', checkForDecimalAndNull((RMBOPCC * calculatePercentage(InterestRatePercentage)), initialConfiguration.NoOfDecimalForPrice))
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
          setPaymentTermObj(Data)
        } else if (res.status === 204) {
          setValue('RepaymentPeriodDays', '')
          setValue('RepaymentPeriodPercentage', '')
          setValue('RepaymentPeriodCost', '')
          checkPaymentTermApplicability('')
          setPaymentTermsApplicability([])
          setPaymentTermObj({})
        }

      }))
    } else {
      setPaymentTermsApplicability([])
      if (!CostingViewMode) {
        props.setPaymentTermsDetail(null, { BOMLevel: data.BOMLevel, PartNumber: data.PartNumber })
      }
    }
  }, [IsPaymentTermsApplicable])

  /**
    * @method checkPaymentTermApplicability
    * @description PAYMENT TERMS APPLICABILITY CALCULATION
    */
  const checkPaymentTermApplicability = (Text) => {
    if (headerCosts !== undefined && Text !== '') {
      const RMBOPCC = headerCosts.NetRawMaterialsCost + headerCosts.NetBoughtOutPartCost + headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal
      const RMBOP = headerCosts.NetRawMaterialsCost + headerCosts.NetBoughtOutPartCost;
      const RMCC = headerCosts.NetRawMaterialsCost + headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal;
      const RepaymentPeriodDays = getValues('RepaymentPeriodDays')
      const RepaymentPeriodPercentage = getValues('RepaymentPeriodPercentage')
      const RepaymentCost = (calculatePercentage(RepaymentPeriodPercentage) / 90) * RepaymentPeriodDays;

      switch (Text) {
        case 'RM':
          setValue('RepaymentPeriodCost', checkForDecimalAndNull((headerCosts.NetRawMaterialsCost * RepaymentCost), initialConfiguration.NoOfDecimalForPrice))
          break;

        case 'RM + CC':
          setValue('RepaymentPeriodCost', checkForDecimalAndNull((RMCC * RepaymentCost), initialConfiguration.NoOfDecimalForPrice))
          break;

        case 'RM + BOP':
          setValue('RepaymentPeriodCost', checkForDecimalAndNull((RMBOP * RepaymentCost), initialConfiguration.NoOfDecimalForPrice))
          break;

        case 'RM + CC + BOP':
          setValue('RepaymentPeriodCost', checkForDecimalAndNull(((RMBOPCC) * RepaymentCost), initialConfiguration.NoOfDecimalForPrice))
          break;

        case 'Fixed':
          setValue('RepaymentPeriodCost', checkForDecimalAndNull(RepaymentPeriodPercentage, initialConfiguration.NoOfDecimalForPrice))
          break;

        case 'Annual ICC (%)':
          setValue('RepaymentPeriodCost', checkForDecimalAndNull((RMBOPCC * RepaymentCost), initialConfiguration.NoOfDecimalForPrice)) //NEED TO ASK HERE ALSO
          break;

        case 'Net Cost':
          setValue('RepaymentPeriodCost', checkForDecimalAndNull((RMBOPCC * RepaymentCost), initialConfiguration.NoOfDecimalForPrice))
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

  //NEED TO ASK HERE ALSO
  const IncludeSurfaceTreatmentCall = () => {

    const { IsCutOffApplicable, CutOffRMC } = RMCCutOffObj;
    const RMBOPCC = headerCosts.NetRawMaterialsCost + headerCosts.NetBoughtOutPartCost + headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal
    const CutOffRMBOPCCTotal = IsCutOffApplicable && headerCosts ? CutOffRMC + headerCosts.NetBoughtOutPartCost + headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal : RMBOPCC;
    const NetSurfaceTreatmentCost = SurfaceTreatmentCost && SurfaceTreatmentCost.NetSurfaceTreatmentCost !== undefined ? checkForNull(SurfaceTreatmentCost.NetSurfaceTreatmentCost) : checkForNull(CostingDataList[0].NetSurfaceTreatmentCost);
    const NetConversionCost = headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal
    // START HERE ADD CC IN OVERHEAD
    if (IsIncludedSurfaceInOverheadProfit && IsSurfaceTreatmentAdded === false && overheadObj && overheadObj.IsOverheadCCApplicable) {

      const { OverheadCCPercentage } = overheadObj;
      setValue('OverheadCCCost', checkForNull(headerCosts !== undefined ? NetConversionCost : 0) + checkForNull(NetSurfaceTreatmentCost))
      setValue('OverheadCCTotalCost', checkForDecimalAndNull((checkForNull((headerCosts !== undefined ? NetConversionCost : 0)) * calculatePercentage(OverheadCCPercentage)), initialConfiguration.NoOfDecimalForPrice))
      setIsSurfaceTreatmentAdded(true)
      setOverheadObj({
        ...overheadObj,
        OverheadCCCost: checkForNull(getValues('OverheadCCCost')),
        OverheadCCTotalCost: checkForDecimalAndNull((getValues('OverheadCCCost') * calculatePercentage(OverheadCCPercentage)), initialConfiguration.NoOfDecimalForPrice),
      })

    } else if (!IsIncludedSurfaceInOverheadProfit && overheadObj && overheadObj.IsOverheadCCApplicable) {

      const { OverheadCCPercentage } = overheadObj;
      setValue('OverheadCCCost', headerCosts !== undefined ? checkForNull(NetConversionCost) : 0)
      setValue('OverheadCCTotalCost', checkForDecimalAndNull((headerCosts !== undefined ? NetConversionCost : 0) * calculatePercentage(OverheadCCPercentage), initialConfiguration.NoOfDecimalForPrice))
      setIsSurfaceTreatmentAdded(false)
      setOverheadObj({
        ...overheadObj,
        OverheadCCCost: headerCosts !== undefined ? NetConversionCost : 0,
        OverheadCCTotalCost: checkForDecimalAndNull((headerCosts !== undefined ? NetConversionCost : 0) * calculatePercentage(OverheadCCPercentage), initialConfiguration.NoOfDecimalForPrice)
      })

      // END HERE ADD CC IN OVERHEAD
    }

    // START ADD CC IN PROFIT
    if (IsIncludedSurfaceInOverheadProfit && IsSurfaceTreatmentAdded === false && profitObj && profitObj.IsProfitCCApplicable) {

      const { ProfitCCPercentage } = profitObj;
      setValue('ProfitCCCost', checkForNull(getValues('ProfitCCCost')) + NetSurfaceTreatmentCost)
      setValue('ProfitCCTotalCost', checkForDecimalAndNull(checkForNull(getValues('ProfitCCCost')) * calculatePercentage(ProfitCCPercentage), initialConfiguration.NoOfDecimalForPrice))
      setIsSurfaceTreatmentAdded(true)
      setProfitObj({
        ...profitObj,
        ProfitCCCost: checkForNull(getValues('ProfitCCCost')),
        ProfitCCTotalCost: checkForDecimalAndNull(checkForNull(getValues('ProfitCCCost')) * calculatePercentage(ProfitCCPercentage), initialConfiguration.NoOfDecimalForPrice),
      })

    } else if (!IsIncludedSurfaceInOverheadProfit && profitObj && profitObj.IsProfitCCApplicable) {

      const { ProfitCCPercentage } = profitObj;
      setValue('ProfitCCCost', headerCosts !== undefined ? checkForNull(NetConversionCost) : 0)
      setValue('ProfitCCTotalCost', checkForDecimalAndNull((headerCosts !== undefined ? checkForNull(NetConversionCost) : 0) * calculatePercentage(ProfitCCPercentage), initialConfiguration.NoOfDecimalForPrice))
      setIsSurfaceTreatmentAdded(false)
      setProfitObj({
        ...profitObj,
        ProfitCCCost: headerCosts !== undefined ? checkForNull(NetConversionCost) : 0,
        ProfitCCTotalCost: checkForDecimalAndNull((headerCosts !== undefined ? checkForNull(NetConversionCost) : 0) * calculatePercentage(ProfitCCPercentage), initialConfiguration.NoOfDecimalForPrice),
      })
      // END HERE ADD CC IN PROFIT
    }

    // START ADD CC IN OVERHEAD COMBINED
    if (IsIncludedSurfaceInOverheadProfit && IsSurfaceTreatmentAdded === false && overheadObj && overheadObj.IsOverheadCombined) {
      const { OverheadApplicability, OverheadPercentage } = overheadObj;

      switch (OverheadApplicability) {
        case 'RM + CC + BOP':
          setValue('OverheadPercentage', OverheadPercentage)
          setValue('OverheadCombinedCost', CutOffRMBOPCCTotal + NetSurfaceTreatmentCost)
          setValue('OverheadCombinedTotalCost', checkForDecimalAndNull((CutOffRMBOPCCTotal + NetSurfaceTreatmentCost) * calculatePercentage(OverheadPercentage), initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(true)
          setOverheadObj({
            ...overheadObj,
            OverheadCombinedCost: checkForNull(getValues('OverheadCombinedCost')),
            OverheadCombinedTotalCost: checkForDecimalAndNull((checkForNull(getValues('OverheadCombinedCost')) * calculatePercentage(OverheadPercentage)), initialConfiguration.NoOfDecimalForPrice),
          })
          break;

        case 'RM + CC':
          const RMCC = (IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost) + NetConversionCost;
          setValue('OverheadPercentage', OverheadPercentage)
          setValue('OverheadCombinedCost', checkForDecimalAndNull((RMCC + NetSurfaceTreatmentCost), initialConfiguration.NoOfDecimalForPrice))
          setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(((RMCC + NetSurfaceTreatmentCost) * calculatePercentage(OverheadPercentage)), initialConfiguration.NoOfDecimalForPrice))
          setOverheadObj({
            ...overheadObj,
            OverheadCombinedCost: checkForDecimalAndNull(getValues('OverheadCombinedCost'), initialConfiguration.NoOfDecimalForPrice),
            OverheadCombinedTotalCost: checkForDecimalAndNull((getValues('OverheadCombinedCost') * calculatePercentage(OverheadPercentage)), initialConfiguration.NoOfDecimalForPrice),
          })
          break;

        case 'BOP + CC':
          const BOPCC = headerCosts.NetBoughtOutPartCost + NetConversionCost;
          setValue('OverheadPercentage', OverheadPercentage)
          setValue('OverheadCombinedCost', checkForDecimalAndNull(BOPCC + NetSurfaceTreatmentCost), initialConfiguration.NoOfDecimalForPrice)
          setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(((BOPCC + NetSurfaceTreatmentCost) * calculatePercentage(OverheadPercentage)), initialConfiguration.NoOfDecimalForPrice))
          setOverheadObj({
            ...overheadObj,
            OverheadCombinedCost: getValues('OverheadCombinedCost'),
            OverheadCombinedTotalCost: checkForDecimalAndNull((getValues('OverheadCombinedCost') * calculatePercentage(OverheadPercentage)), initialConfiguration.NoOfDecimalForPrice),
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
          setValue('OverheadCombinedCost', CutOffRMBOPCCTotal)
          setValue('OverheadCombinedTotalCost', checkForDecimalAndNull((CutOffRMBOPCCTotal * calculatePercentage(OverheadPercentage)), initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(false)
          setOverheadObj({
            ...overheadObj,
            OverheadCombinedCost: getValues('OverheadCombinedCost'),
            OverheadCombinedTotalCost: checkForDecimalAndNull((getValues('OverheadCombinedCost') * calculatePercentage(OverheadPercentage)), initialConfiguration.NoOfDecimalForPrice),
          })
          break;

        case 'RM + CC':
          const RMCC = (IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost) + NetConversionCost;
          setValue('OverheadPercentage', OverheadPercentage)
          setValue('OverheadCombinedCost', checkForDecimalAndNull(RMCC, initialConfiguration.NoOfDecimalForPrice))
          setValue('OverheadCombinedTotalCost', checkForDecimalAndNull((RMCC * calculatePercentage(OverheadPercentage)), initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(false)
          setOverheadObj({
            ...overheadObj,
            OverheadCombinedCost: getValues('OverheadCombinedCost'),
            OverheadCombinedTotalCost: checkForDecimalAndNull((getValues('OverheadCombinedCost') * calculatePercentage(OverheadPercentage)), initialConfiguration.NoOfDecimalForPrice),
          })
          break;

        case 'BOP + CC':
          const BOPCC = headerCosts.NetBoughtOutPartCost + NetConversionCost;
          setValue('OverheadPercentage', OverheadPercentage)
          setValue('OverheadCombinedCost', BOPCC)
          setValue('OverheadCombinedTotalCost', checkForDecimalAndNull((BOPCC * calculatePercentage(OverheadPercentage)), initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(false)
          setOverheadObj({
            ...overheadObj,
            OverheadCombinedCost: getValues('OverheadCombinedCost'),
            OverheadCombinedTotalCost: checkForDecimalAndNull((getValues('OverheadCombinedCost') * calculatePercentage(OverheadPercentage)), initialConfiguration.NoOfDecimalForPrice),
          })
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
          setValue('ProfitCombinedCost', checkForDecimalAndNull((CutOffRMBOPCCTotal + NetSurfaceTreatmentCost), initialConfiguration.NoOfDecimalForPrice))
          setValue('ProfitCombinedTotalCost', checkForDecimalAndNull((CutOffRMBOPCCTotal + NetSurfaceTreatmentCost) * calculatePercentage(ProfitPercentage), initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(true)
          setProfitObj({
            ...profitObj,
            ProfitCombinedCost: getValues('ProfitCombinedCost'),
            ProfitCombinedTotalCost: checkForDecimalAndNull((getValues('ProfitCombinedCost') * calculatePercentage(ProfitPercentage)), initialConfiguration.NoOfDecimalForPrice),
          })
          break;

        case 'RM + CC':
          const RMCC = (IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost) + NetConversionCost;
          setValue('ProfitPercentage', ProfitPercentage)
          setValue('ProfitCombinedCost', checkForDecimalAndNull((RMCC + NetSurfaceTreatmentCost), initialConfiguration.NoOfDecimalForPrice))
          setValue('ProfitCombinedTotalCost', checkForDecimalAndNull((RMCC + NetSurfaceTreatmentCost) * calculatePercentage(ProfitPercentage), initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(true)
          setProfitObj({
            ...profitObj,
            ProfitCombinedCost: getValues('ProfitCombinedCost'),
            ProfitCombinedTotalCost: checkForDecimalAndNull((getValues('ProfitCombinedCost') * calculatePercentage(ProfitPercentage)), initialConfiguration.NoOfDecimalForPrice),
          })
          break;

        case 'BOP + CC':
          const BOPCC = headerCosts.NetBoughtOutPartCost + NetConversionCost;
          setValue('ProfitPercentage', ProfitPercentage)
          setValue('ProfitCombinedCost', checkForDecimalAndNull((BOPCC + NetSurfaceTreatmentCost), initialConfiguration.NoOfDecimalForPrice))
          setValue('ProfitCombinedTotalCost', checkForDecimalAndNull((getValues('ProfitCombinedCost') * calculatePercentage(ProfitPercentage)), initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(true)
          setProfitObj({
            ...profitObj,
            ProfitCombinedCost: getValues('ProfitCombinedCost'),
            ProfitCombinedTotalCost: checkForDecimalAndNull((getValues('ProfitCombinedCost') * calculatePercentage(ProfitPercentage)), initialConfiguration.NoOfDecimalForPrice),
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
          setValue('ProfitCombinedCost', checkForDecimalAndNull(CutOffRMBOPCCTotal, initialConfiguration.NoOfDecimalForPrice))
          setValue('ProfitCombinedTotalCost', checkForDecimalAndNull((getValues('ProfitCombinedCost') * calculatePercentage(ProfitPercentage)), initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(false)
          setProfitObj({
            ...profitObj,
            ProfitCombinedCost: getValues('ProfitCombinedCost'),
            ProfitCombinedTotalCost: checkForDecimalAndNull((getValues('ProfitCombinedCost') * calculatePercentage(ProfitPercentage)), initialConfiguration.NoOfDecimalForPrice),
          })
          break;

        case 'RM + CC':
          const RMCC = (IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost) + NetConversionCost;
          setValue('ProfitPercentage', ProfitPercentage)
          setValue('ProfitCombinedCost', RMCC)
          setValue('ProfitCombinedTotalCost', checkForDecimalAndNull((RMCC * calculatePercentage(ProfitPercentage)), initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(false)
          setProfitObj({
            ...profitObj,
            ProfitCombinedCost: getValues('ProfitCombinedCost'),
            ProfitCombinedTotalCost: checkForDecimalAndNull((getValues('ProfitCombinedCost') * calculatePercentage(ProfitPercentage)), initialConfiguration.NoOfDecimalForPrice),
          })
          break;

        case 'BOP + CC':
          const BOPCC = headerCosts.NetBoughtOutPartCost + NetConversionCost;
          setValue('ProfitPercentage', ProfitPercentage)
          setValue('ProfitCombinedCost', checkForDecimalAndNull(BOPCC, initialConfiguration.NoOfDecimalForPrice))
          setValue('ProfitCombinedTotalCost', checkForDecimalAndNull((BOPCC * calculatePercentage(ProfitPercentage)), initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(false)
          setProfitObj({
            ...profitObj,
            ProfitCombinedCost: getValues('ProfitCombinedCost'),
            ProfitCombinedTotalCost: checkForDecimalAndNull((getValues('ProfitCombinedCost') * calculatePercentage(ProfitPercentage)), initialConfiguration.NoOfDecimalForPrice),
          })
          break;

        default:
          break;
      }
      // END HERE ADD CC IN PROFIT COMBINED
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
                  rules={{ required: false }}
                  register={register}
                  defaultValue={modelType.length !== 0 ? modelType : ''}
                  options={renderListing('ModelType')}
                  mandatory={false}
                  disabled={CostingViewMode || CheckIsCostingDateSelected(CostingEffectiveDate) ? true : false}
                  handleChange={(ModelTypeValues) => {
                    handleModelTypeChange(ModelTypeValues, true)
                  }}
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
                        <div className="d-inline-block">
                          {overheadObj?.OverheadApplicability.includes('RM') && RMCCutOffObj?.IsCutOffApplicable && RMCCutOffObj?.CutOffRMC > 0 &&
                            <span className={'fa fa-info-circle mt9 tooltip-n tooltip_custom_right mb-n3'}>
                              <span class="tooltiptext">{`RM cut-off price ${RMCCutOffObj.CutOffRMC} applied`}</span>
                            </span>
                          }
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
                          /></div>
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
                        <div className="d-inline-block">
                          {RMCCutOffObj?.IsCutOffApplicable && RMCCutOffObj?.CutOffRMC > 0 &&
                            <span className={'fa fa-info-circle mt9 tooltip-n tooltip_custom_right mb-n3'}>
                              <span class="tooltiptext">{`RM cut-off price ${RMCCutOffObj.CutOffRMC} applied`}</span>
                            </span>}
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
                          /></div>
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
                        <div className="d-inline-block">
                          {profitObj?.ProfitApplicability.includes('RM') && RMCCutOffObj?.IsCutOffApplicable && RMCCutOffObj?.CutOffRMC > 0 &&
                            <span className={'fa fa-info-circle mt9 tooltip-n tooltip_custom_right mb-n3'}>
                              <span class="tooltiptext">{`RM cut-off price ${RMCCutOffObj.CutOffRMC} applied`}</span>
                            </span>
                          }
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
                          /></div>
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
                        <div className="d-inline-block">
                          {RMCCutOffObj?.IsCutOffApplicable && RMCCutOffObj?.CutOffRMC > 0 &&
                            <span className={'fa fa-info-circle mt9 tooltip-n tooltip_custom_right mb-n3'}>
                              <span class="tooltiptext">{`RM cut-off price ${RMCCutOffObj.CutOffRMC} applied`}</span>
                            </span>
                          }
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
                          /></div>
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
                {applicability.label !== 'Fixed' ?
                  <NumberFieldHookForm
                    label={`Rejection (%)`}
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
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.RejectionPercentage}
                    disabled={CostingViewMode ? true : false}
                  />
                  :
                  //THIS FIELD WILL RENDER WHEN REJECTION TYPE FIXED
                  <NumberFieldHookForm
                    label={`Rejection`}
                    name={'RejectionPercentage'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    rules={{
                      required: false,
                      pattern: { value: /^\d*\.?\d*$/, message: 'Invalid Number.' },
                    }}
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.RejectionPercentage}
                    disabled={CostingViewMode ? true : false}
                  />}
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
                    {ICCapplicability.label !== 'Fixed' ?
                      <NumberFieldHookForm
                        label={`Interest Rate (%)`}
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
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.InterestRatePercentage}
                        disabled={(CostingViewMode || ICCapplicability.label !== 'Fixed') ? true : false}
                      />
                      :
                      <NumberFieldHookForm
                        label={`Interest Rate`}
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
                        }}
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.InterestRatePercentage}
                        disabled={CostingViewMode ? true : false}
                      />}
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
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.RepaymentPeriodPercentage}
                        disabled={CostingViewMode ? true : false}
                      />
                      :
                      <NumberFieldHookForm
                        label={`Interest Rate}`}
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
                        handleChange={() => { }}
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


            <Row className="sf-btn-footer no-gutters justify-content-between costing-overhead-profit-footer">
              <div className="col-sm-12 text-right bluefooter-butn">
                {!CostingViewMode && <button
                  type={'submit'}
                  className="submit-button mr5 save-btn">
                  <div className={"save-icon"}></div>
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