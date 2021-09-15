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
import Rejection from './Rejection';
import Icc from './Icc';
import PaymentTerms from './PaymentTerms';

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


  const [modelType, setModelType] = useState(data.CostingPartDetails && data.CostingPartDetails.ModelType !== null ? { label: data.CostingPartDetails.ModelType, value: data.CostingPartDetails.ModelTypeId } : [])


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

    setTimeout(() => {
      IncludeSurfaceTreatmentCall()
    }, 3000)

  }, []);

  /**
   * @function isViewMode
   * @description to check whether costing is in view mode
  */

  const isViewMode = () => {
    if (CostingViewMode) return false
  }

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
    /*********** OVERHEAD AND PROFIT CALCULATION STARTS FROM HERE **********/
    if (!CostingViewMode) {

      checkIsOverheadCombined()
      checkIsOverheadRMApplicable()
      checkIsOverheadBOPApplicable()
      checkIsOverheadCCApplicable()

      checkIsProfitCombined()
      checkIsProfitRMApplicable()
      checkIsProfitBOPApplicable()
      checkIsProfitCCApplicable()
    }
  }

  /**
  * @method useEffect
  * @description TO CHANGE OVERHEADS VALUE WHEN RM BOP CC VALUES CHANGES FROM RMCC TAB
  */
  useEffect(() => {

    if (modelType && modelType.value !== undefined) {
      handleModelTypeChange(modelType, false)
    }

  }, [headerCosts && headerCosts.NetTotalRMBOPCC])

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

  const profitFixedFieldValues = useWatch({
    control,
    name: 'ProfitFixedPercentage',
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
    if (!CostingViewMode) {
      dispatch(fetchModelTypeAPI('--Model Types--', (res) => { }))
      dispatch(getPaymentTermsAppliSelectListKeyValue((res) => { }))
    }
  }, []);

  //EFFECT CALLED WHEN OVERHEAD OR PROFIT VALUES CHANGED
  useEffect(() => {
    calculateOverheadFixedTotalCost()
    calculateProfitFixedTotalCost()
  }, [overheadFixedFieldValues, profitFixedFieldValues]);

  const modelTypes = useSelector(state => state.comman.modelTypes)

  /**
  * @method calculateOverheadFixedTotalCost
  * @description CALCULATE OVERHEAD FIXED TOTAL COST
  */
  const calculateOverheadFixedTotalCost = () => {
    if (!CostingViewMode) {
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
    isViewMode()
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
        const RMCC = headerCosts.NetRawMaterialsCost + headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal;
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
    if (!CostingViewMode) {
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
    if (!CostingViewMode) {
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
  }

  /**
  * @method checkIsProfitRMApplicable
  * @description PROFIT RM APPLICABILITY CALCULATION
  */
  const checkIsProfitRMApplicable = () => {
    if (!CostingViewMode) {
      if (headerCosts !== undefined && profitObj && profitObj.IsProfitRMApplicable) {
        const { ProfitRMPercentage } = profitObj;
        const { IsCutOffApplicable, CutOffRMC } = RMCCutOffObj;
        setValue('ProfitRMPercentage', ProfitRMPercentage)
        setValue('ProfitRMCost', IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost)
        setValue('ProfitRMTotalCost', checkForDecimalAndNull(((IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost) * calculatePercentage(ProfitRMPercentage)), initialConfiguration.NoOfDecimalForPrice))
      }
    }
  }

  /**
  * @method checkIsProfitBOPApplicable
  * @description OVERHEAD BOP APPLICABILITY CALCULATION
  */
  const checkIsProfitBOPApplicable = () => {
    if (!CostingViewMode) {
      if (headerCosts !== undefined && profitObj && profitObj.IsProfitBOPApplicable) {
        const { ProfitBOPPercentage } = profitObj;
        setValue('ProfitBOPPercentage', ProfitBOPPercentage)
        setValue('ProfitBOPCost', headerCosts.NetBoughtOutPartCost)
        setValue('ProfitBOPTotalCost', checkForDecimalAndNull((headerCosts.NetBoughtOutPartCost * calculatePercentage(ProfitBOPPercentage)), initialConfiguration.NoOfDecimalForPrice))
      }
    }
  }

  /**
    * @method checkIsProfitCCApplicable
    * @description PROFIT CC APPLICABILITY CALCULATION
    */
  const checkIsProfitCCApplicable = () => {
    if (!CostingViewMode) {
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
  }


  /**
  * @method renderListing
  * @description RENDER LISTING (NEED TO BREAK THIS)
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

  }

  /**
    * @method handleModelTypeChange
    * @description  USED TO HANDLE MODEL TYPE CHANGE
    */
  const handleModelTypeChange = (newValue, IsDropdownClicked) => {
    if (IsDropdownClicked && !CostingViewMode) {
      setOverheadObj({})
      setProfitObj({})
      setOverheadValues({}, true)
      setProfitValues({}, true)
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
    if (!CostingViewMode) {

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
  }

  /**
  * @method setProfitValues
  * @description  SET PROFIT VALUES IN FIXED, COMBINED, RM, CC AND FIXED
  */
  const setProfitValues = (dataObj, IsAPIResponse) => {
    if (!CostingViewMode) {
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
  }

  /**
  * @method IncludeSurfaceTreatmentCall
  * @description INCLUDE SURFACE TREATMENT IN TO OVERHEAD AND PROFIT
  */

  const IncludeSurfaceTreatmentCall = () => {

    if (!CostingViewMode) {


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
                          defaultValue={overheadObj.OverheadFixedPercentage !== null ? overheadObj.OverheadFixedPercentage : ''}
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
                          defaultValue={overheadObj.OverheadFixedCost !== null ? overheadObj.OverheadFixedCost : ''}
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
                          defaultValue={overheadObj.OverheadFixedTotalCost !== null ? overheadObj.OverheadFixedTotalCost : ''}
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
                            defaultValue={overheadObj.OverheadCombinedCost !== null ? checkForDecimalAndNull(overheadObj.OverheadCombinedCost, initialConfiguration.NoOfDecimalForPrice) : ''}
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
                          defaultValue={overheadObj.OverheadRMPercentage !== null ? overheadObj.OverheadRMPercentage : ''}
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
                            defaultValue={overheadObj.OverheadRMCost !== null ? checkForDecimalAndNull(overheadObj.OverheadRMCost, initialConfiguration.NoOfDecimalForPrice) : ''}
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
                          defaultValue={overheadObj.OverheadRMTotalCost !== null ? overheadObj.OverheadRMTotalCost : ''}
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
                          defaultValue={overheadObj.OverheadBOPPercentage !== null ? overheadObj.OverheadBOPPercentage : ''}
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
                          defaultValue={overheadObj.OverheadBOPCost !== null ? checkForDecimalAndNull(overheadObj.OverheadBOPCost, initialConfiguration.NoOfDecimalForPrice) : ''}
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
                          defaultValue={overheadObj.OverheadBOPTotalCost !== null ? overheadObj.OverheadBOPTotalCost : ''}
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
                          defaultValue={overheadObj.OverheadCCPercentage !== null ? overheadObj.OverheadCCPercentage : ''}
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
                          defaultValue={overheadObj.OverheadCCCost !== null ? checkForDecimalAndNull(overheadObj.OverheadCCCost, initialConfiguration.NoOfDecimalForPrice) : ''}
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
                          defaultValue={overheadObj.OverheadCCTotalCost !== null ? overheadObj.OverheadCCTotalCost : ''}
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
                          defaultValue={profitObj.ProfitFixedPercentage !== null ? profitObj.ProfitFixedPercentage : ''}
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
                          defaultValue={profitObj.ProfitFixedCost !== null ? profitObj.ProfitFixedCost : ''}
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
                          defaultValue={profitObj.ProfitFixedTotalCost !== null ? profitObj.ProfitFixedTotalCost : ''}
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
                          defaultValue={profitObj.ProfitPercentage !== null ? profitObj.ProfitPercentage : ''}
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
                            defaultValue={profitObj.ProfitCombinedCost !== null ? checkForDecimalAndNull(profitObj.ProfitCombinedCost, initialConfiguration.NoOfDecimalForPrice) : ''}
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
                          defaultValue={profitObj.ProfitCombinedTotalCost !== null ? profitObj.ProfitCombinedTotalCost : ''}
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
                          defaultValue={profitObj.ProfitRMPercentage !== null ? profitObj.ProfitRMPercentage : ''}
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
                            defaultValue={profitObj.ProfitRMCost !== null ? checkForDecimalAndNull(profitObj.ProfitRMCost, initialConfiguration.NoOfDecimalForPrice) : ''}
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
                          defaultValue={profitObj.ProfitRMTotalCost !== null ? profitObj.ProfitRMTotalCost : ''}
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
                          defaultValue={profitObj.ProfitBOPPercentage !== null ? profitObj.ProfitBOPPercentage : ''}
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
                          defaultValue={profitObj.ProfitBOPCost !== null ? checkForDecimalAndNull(profitObj.ProfitBOPCost, initialConfiguration.NoOfDecimalForPrice) : ''}
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
                          defaultValue={profitObj.ProfitBOPTotalCost !== null ? profitObj.ProfitBOPTotalCost : ''}
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
                          defaultValue={profitObj.ProfitCCPercentage !== null ? profitObj.ProfitCCPercentage : ''}
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
                          defaultValue={profitObj.ProfitCCCost !== null ? checkForDecimalAndNull(profitObj.ProfitCCCost, initialConfiguration.NoOfDecimalForPrice) : ''}
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
                          defaultValue={profitObj.ProfitCCTotalCost !== null ? profitObj.ProfitCCTotalCost : ''}
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

            {/* THIS IS REJECTION SECTION */}
            <Rejection
              Controller={Controller}
              control={control}
              //  rules={rules}
              register={register}
              defaultValue={defaultValues}
              setValue={setValue}
              getValues={getValues}
              errors={errors}
              useWatch={useWatch}
              CostingRejectionDetail={CostingRejectionDetail}
              data={data}
              setRejectionDetail={props.setRejectionDetail}
            />

            <Icc
              Controller={Controller}
              control={control}
              //  rules={rules}
              register={register}
              defaultValue={defaultValues}
              setValue={setValue}
              getValues={getValues}
              errors={errors}
              useWatch={useWatch}
              CostingInterestRateDetail={CostingInterestRateDetail}
              data={data}
              setICCDetail={props.setICCDetail}
            />

            <PaymentTerms
              Controller={Controller}
              control={control}
              //  rules={rules}
              register={register}
              defaultValue={defaultValues}
              setValue={setValue}
              getValues={getValues}
              errors={errors}
              useWatch={useWatch}
              PaymentTermDetail={PaymentTermDetail}
              data={data}
              setPaymentTermsDetail={props.setPaymentTermsDetail}
            />

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