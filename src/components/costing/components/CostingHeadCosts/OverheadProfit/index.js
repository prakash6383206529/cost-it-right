import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller, useWatch, } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Row, } from 'reactstrap';
import { SearchableSelectHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs';
import { calculatePercentage, checkForDecimalAndNull, checkForNull, CheckIsCostingDateSelected, getConfigurationKey, } from '../../../../../helper';
import { fetchModelTypeAPI, getPaymentTermsAppliSelectListKeyValue } from '../../../../../actions/Common';
import { getOverheadProfitDataByModelType, gridDataAdded, isOverheadProfitDataChange, } from '../../../actions/Costing';
import { costingInfoContext, netHeadCostContext, SurfaceCostContext } from '../../CostingDetailStepTwo';
import { EMPTY_GUID, GET_RAW_MATERIAL_FILTER_BY_GRADE_SELECTLIST } from '../../../../../config/constants';
import { ViewCostingContext } from '../../CostingDetails';
import Rejection from './Rejection';
import Icc from './Icc';
import PaymentTerms from './PaymentTerms';
import { debounce } from 'lodash';

function OverheadProfit(props) {
  const { data } = props;

  const { CostingOverheadDetail, CostingProfitDetail, CostingRejectionDetail, CostingInterestRateDetail } = props.data.CostingPartDetails;

  const ICCApplicabilityDetail = CostingInterestRateDetail && CostingInterestRateDetail.ICCApplicabilityDetail !== null ? CostingInterestRateDetail.ICCApplicabilityDetail : {}

  const PaymentTermDetail = CostingInterestRateDetail && CostingInterestRateDetail.PaymentTermDetail !== null ? CostingInterestRateDetail.PaymentTermDetail : {}
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)

  const defaultValues = {

    //REJECTION FIELDS
    Applicability: CostingRejectionDetail && CostingRejectionDetail.RejectionApplicability !== null ? { label: CostingRejectionDetail.RejectionApplicability, value: CostingRejectionDetail.RejectionApplicabilityId } : '',
    RejectionPercentage: CostingRejectionDetail && CostingRejectionDetail.RejectionPercentage !== null ? CostingRejectionDetail.RejectionPercentage : '',
    RejectionCost: CostingRejectionDetail && CostingRejectionDetail.RejectionCost !== null ? checkForDecimalAndNull(CostingRejectionDetail.RejectionCost, initialConfiguration.NoOfDecimalForPrice) : '',
    RejectionTotalCost: CostingRejectionDetail && CostingRejectionDetail.RejectionTotalCost !== null ? checkForDecimalAndNull(CostingRejectionDetail.RejectionTotalCost, initialConfiguration.NoOfDecimalForPrice) : '',

    // ICC FIELDS
    InterestRatePercentage: ICCApplicabilityDetail !== null ? ICCApplicabilityDetail.InterestRate : '',
    InterestRateCost: ICCApplicabilityDetail !== null ? checkForDecimalAndNull(ICCApplicabilityDetail.CostApplicability, initialConfiguration.NoOfDecimalForPrice) : '',
    NetICCTotal: ICCApplicabilityDetail !== null ? checkForDecimalAndNull(ICCApplicabilityDetail.NetCost, initialConfiguration.NoOfDecimalForPrice) : '',

    //PAYMENT TERMS FIELDS
    PaymentTermsApplicability: PaymentTermDetail !== null ? PaymentTermDetail.PaymentTermApplicability : '',
    RepaymentPeriodDays: PaymentTermDetail !== null ? PaymentTermDetail.RepaymentPeriod : '',
    RepaymentPeriodPercentage: PaymentTermDetail !== null ? checkForDecimalAndNull(PaymentTermDetail.InterestRate, initialConfiguration.NoOfDecimalForPrice) : '',
    RepaymentPeriodCost: PaymentTermDetail !== null ? checkForDecimalAndNull(PaymentTermDetail.NetCost, initialConfiguration.NoOfDecimalForPrice) : '',
  }
  const { subAssemblyTechnologyTabData } = useSelector(state => state.SubAssembly)

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

  const { CostingEffectiveDate, CostingDataList, IsIncludedSurfaceInOverheadProfit, RMCCutOffObj } = useSelector(state => state.costing)

  const [overheadObj, setOverheadObj] = useState(CostingOverheadDetail)
  const [profitObj, setProfitObj] = useState(CostingProfitDetail)
  const [tempOverheadObj, setTempOverheadObj] = useState(CostingOverheadDetail)
  const [tempProfitObj, setTempProfitObj] = useState(CostingProfitDetail)
  const [partType, setpartType] = useState(costData?.TechnologyName === 'Assembly')   //HELP



  const [modelType, setModelType] = useState(data.CostingPartDetails && data.CostingPartDetails?.ModelType !== null ? { label: data.CostingPartDetails?.ModelType, value: data.CostingPartDetails.ModelTypeId } : [])


  const [IsSurfaceTreatmentAdded, setIsSurfaceTreatmentAdded] = useState(false)

  //INITIAL CALLED EFFECT TO SET VALUES
  useEffect(() => {

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
  }, [CostingDataList[0]?.IsRMCutOffApplicable])

  /**
  * @method UpdateForm
  * @description UPDATE FORM ON EACH INITIAL RENDER
  */
  const UpdateForm = () => {
    /*********** OVERHEAD AND PROFIT CALCULATION STARTS FROM HERE **********/
    if (!CostingViewMode) {

      // checkIsOverheadCombined()
      // checkIsOverheadRMApplicable()
      // checkIsOverheadBOPApplicable()
      // checkIsOverheadCCApplicable()

      // checkIsProfitCombined()
      // checkIsProfitRMApplicable()
      // checkIsProfitBOPApplicable()
      // checkIsProfitCCApplicable()
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
        "OverheadCombinedCost": overheadObj && overheadObj.IsOverheadCombined ? overheadObj.OverheadCombinedCost : '',
        "OverheadCombinedTotalCost": overheadObj && overheadObj.IsOverheadCombined ? overheadObj.OverheadCombinedTotalCost : '',

        "IsOverheadCCApplicable": overheadObj && overheadObj.IsOverheadCCApplicable,
        "OverheadCCPercentage": overheadObj && overheadObj.IsOverheadCCApplicable ? tempOverheadObj.OverheadCCPercentage : '',
        "OverheadCCCost": overheadObj && overheadObj.IsOverheadCCApplicable ? tempOverheadObj.OverheadCCCost : '',
        "OverheadCCTotalCost": overheadObj && overheadObj.IsOverheadCCApplicable ? tempOverheadObj.OverheadCCTotalCost : '',

        "IsOverheadBOPApplicable": overheadObj && overheadObj.IsOverheadBOPApplicable,
        "OverheadBOPPercentage": overheadObj && overheadObj.IsOverheadBOPApplicable ? tempOverheadObj.OverheadBOPPercentage : '',
        "OverheadBOPCost": overheadObj && overheadObj.IsOverheadBOPApplicable ? tempOverheadObj.OverheadBOPCost : '',
        "OverheadBOPTotalCost": overheadObj && overheadObj.IsOverheadBOPApplicable ? tempOverheadObj.OverheadBOPTotalCost : '',

        "IsOverheadRMApplicable": overheadObj && overheadObj.IsOverheadRMApplicable,
        "OverheadRMPercentage": overheadObj && overheadObj.IsOverheadRMApplicable ? tempOverheadObj.OverheadRMPercentage : '',
        "OverheadRMCost": overheadObj && overheadObj.IsOverheadRMApplicable ? tempOverheadObj.OverheadRMCost : '',
        "OverheadRMTotalCost": overheadObj && overheadObj.IsOverheadRMApplicable ? tempOverheadObj.OverheadRMTotalCost : '',

        "IsOverheadFixedApplicable": overheadObj && overheadObj.IsOverheadFixedApplicable,
        "OverheadFixedPercentage": overheadObj && overheadObj.IsOverheadFixedApplicable ? overheadObj.OverheadFixedPercentage : '',
        "OverheadFixedCost": overheadObj && overheadObj.IsOverheadFixedApplicable ? overheadObj.OverheadFixedCost : '',
        "OverheadFixedTotalCost": overheadObj && overheadObj.IsOverheadFixedApplicable ? overheadObj.OverheadFixedPercentage : '',

        "IsSurfaceTreatmentApplicable": IsIncludedSurfaceInOverheadProfit,
      }

      let profitTempObj = {
        "ProfitId": profitObj && profitObj.ProfitId,
        "ProfitApplicabilityId": profitObj && profitObj.ProfitApplicabilityId,
        "ProfitApplicability": profitObj && profitObj.ProfitApplicability,

        "IsProfitCombined": profitObj && profitObj.IsProfitCombined,
        "ProfitPercentage": profitObj && profitObj.IsProfitCombined ? profitObj.ProfitPercentage : '',
        "ProfitCombinedCost": profitObj && profitObj.IsProfitCombined ? profitObj.ProfitCombinedCost : '',
        "ProfitCombinedTotalCost": profitObj && profitObj.IsProfitCombined ? profitObj.ProfitCombinedTotalCost : '',

        "IsProfitCCApplicable": profitObj && profitObj.IsProfitCCApplicable,
        "ProfitCCPercentage": profitObj && profitObj.IsProfitCCApplicable ? tempProfitObj.ProfitCCPercentage : '',
        "ProfitCCCost": profitObj && profitObj.IsProfitCCApplicable ? tempProfitObj.ProfitCCCost : '',
        "ProfitCCTotalCost": profitObj && profitObj.IsProfitCCApplicable ? tempProfitObj.ProfitCCTotalCost : '',

        "IsProfitBOPApplicable": profitObj && profitObj.IsProfitBOPApplicable,
        "ProfitBOPPercentage": profitObj && profitObj.IsProfitBOPApplicable ? tempProfitObj.ProfitBOPPercentage : '',
        "ProfitBOPCost": profitObj && profitObj.IsProfitBOPApplicable ? tempProfitObj.ProfitBOPCost : '',
        "ProfitBOPTotalCost": profitObj && profitObj.IsProfitBOPApplicable ? tempProfitObj.ProfitBOPTotalCost : '',

        "IsProfitRMApplicable": profitObj && profitObj.IsProfitRMApplicable,
        "ProfitRMPercentage": profitObj && profitObj.IsProfitRMApplicable ? tempProfitObj.ProfitRMPercentage : '',
        "ProfitRMCost": profitObj && profitObj.IsProfitRMApplicable ? tempProfitObj.ProfitRMCost : '',
        "ProfitRMTotalCost": profitObj && profitObj.IsProfitRMApplicable ? tempProfitObj.ProfitRMTotalCost : '',

        "IsProfitFixedApplicable": profitObj && profitObj.IsProfitFixedApplicable,
        "ProfitFixedPercentage": profitObj && profitObj.IsProfitFixedApplicable ? profitObj.ProfitFixedPercentage : '',
        "ProfitFixedCost": profitObj && profitObj.IsProfitFixedApplicable ? profitObj.ProfitFixedCost : '',
        "ProfitFixedTotalCost": profitObj && profitObj.IsProfitFixedApplicable ? profitObj.ProfitFixedTotalCost : '',

        "IsSurfaceTreatmentApplicable": IsIncludedSurfaceInOverheadProfit,
      }

      if (!CostingViewMode) {
        props.setOverheadDetail({ overheadObj: tempObj, profitObj: profitTempObj, modelType: modelType }, { BOMLevel: data.BOMLevel, PartNumber: data.PartNumber })
      }
    }, 500)

  }, [overheadObj, profitObj, tempOverheadObj, tempProfitObj]);

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
    if (IsDropdownClicked && !CostingViewMode && !CheckIsCostingDateSelected(CostingEffectiveDate)) {
      dispatch(isOverheadProfitDataChange(true))

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
          plantId: (getConfigurationKey()?.IsPlantRequiredForOverheadProfitInterestRate && !costData?.IsVendor) ? costData.PlantId : (getConfigurationKey()?.IsDestinationPlantConfigure && costData?.IsVendor) ? costData.DestinationPlantId : EMPTY_GUID
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

  const subAssemblyOverheadCalc = (dataObj) => {
    if (subAssemblyTechnologyTabData) {

      const assemblyLevelOperations = checkForNull(subAssemblyTechnologyTabData && subAssemblyTechnologyTabData[0]?.processCostValue) + checkForNull(subAssemblyTechnologyTabData && subAssemblyTechnologyTabData[0]?.operationCostValue)
      const BOPTotalCost = subAssemblyTechnologyTabData && subAssemblyTechnologyTabData[0]?.CostingPartDetails?.CostPerAssemblyBOP
      const totalAssemblyCost = subAssemblyTechnologyTabData && subAssemblyTechnologyTabData[0]?.CostingPartDetails?.CostPerAssembly
      const EditPartCost = subAssemblyTechnologyTabData && subAssemblyTechnologyTabData[0]?.CostingPartDetails?.EditPartCost

      const totalCCCost = checkForNull(subAssemblyTechnologyTabData && subAssemblyTechnologyTabData[0]?.processCostValue) + checkForNull(subAssemblyTechnologyTabData && subAssemblyTechnologyTabData[0]?.operationCostValue)
      const RM_BOPCost = subAssemblyTechnologyTabData && subAssemblyTechnologyTabData[0]?.CostingPartDetails?.CostPerAssembly * calculatePercentage(dataObj.OverheadPercentage)
      const CCCost = totalCCCost * calculatePercentage((dataObj.OverheadPercentage && dataObj.OverheadPercentage !== '') ? dataObj.OverheadPercentage : 3)

      let OverheadPercentage = 0
      let OverheadCombinedCost = 0
      let OverheadCombinedTotalCost = 0

      switch (dataObj?.OverheadApplicability) {

        case 'RM':
          OverheadPercentage = checkForNull((dataObj.IsOverheadCombined === false) ? dataObj.OverheadRMPercentage : '')
          OverheadCombinedCost = checkForNull(EditPartCost)
          OverheadCombinedTotalCost = checkForNull(OverheadCombinedCost) * calculatePercentage(checkForNull(OverheadPercentage))

          setValue('OverheadPercentage', OverheadPercentage)
          setValue('OverheadCombinedCost', OverheadCombinedCost)
          setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(OverheadCombinedTotalCost, initialConfiguration.NoOfDecimalForPrice))
          // OverheadPercentage = checkForNull(dataObj.OverheadRMPercentage)
          // OverheadCombinedCost = checkForNull(EditPartCost)
          // OverheadCombinedTotalCost = checkForNull(OverheadCombinedCost) * calculatePercentage(checkForNull(OverheadPercentage))

          // setValue('OverheadRMPercentage', OverheadPercentage)
          // setValue('OverheadRMCost', OverheadCombinedCost)
          // setValue('OverheadRMTotalCost', checkForDecimalAndNull(OverheadCombinedTotalCost, initialConfiguration.NoOfDecimalForPrice))

          // const objj = { 
          //   IsOverheadBOPApplicable: false,
          //   IsOverheadCCApplicable: false,
          //   IsOverheadCombined: true,
          //   IsOverheadFixedApplicable: false,
          //   IsOverheadRMApplicable: false,
          //   OverheadApplicability: "RM + CC",
          //   OverheadApplicabilityId: 4,
          //   OverheadBOPCost: 0,
          //   OverheadBOPPercentage: null,
          //   OverheadBOPTotalCost: 0,
          //   OverheadCCCost: 0,
          //   OverheadCCPercentage: null,
          //   OverheadCCTotalCost: 0,
          //   OverheadCombinedCost: 0,
          //   OverheadCombinedTotalCost: 0,
          //   OverheadDetailId: null,
          //   OverheadFixedCost: 0,
          //   OverheadFixedPercentage: 0,
          //   OverheadFixedTotalCost: 0,
          //   OverheadId: "2c6ba632-0d12-4345-9021-f890f628adf5",
          //   OverheadPercentage: 5,
          //   OverheadRMCost: 0,
          //   OverheadRMPercentage: null,
          //   OverheadRMTotalCost: 0
          // }
          setOverheadObj({
            ...dataObj,
            OverheadPercentage: OverheadPercentage,
            OverheadCombinedCost: OverheadCombinedCost,
            OverheadCombinedTotalCost: OverheadCombinedTotalCost,
            IsOverheadCombined: true,
            IsOverheadRMApplicable: false,
          })
          break;

        case 'BOP':
          OverheadPercentage = checkForNull((dataObj.IsOverheadCombined === false) ? dataObj.OverheadBOPPercentage : '')
          OverheadCombinedCost = checkForNull(BOPTotalCost)
          OverheadCombinedTotalCost = checkForNull(OverheadCombinedCost) * calculatePercentage(checkForNull(OverheadPercentage))

          setValue('OverheadPercentage', (OverheadPercentage))
          setValue('OverheadCombinedCost', OverheadCombinedCost)
          setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(OverheadCombinedTotalCost, initialConfiguration.NoOfDecimalForPrice))

          setOverheadObj({
            ...dataObj,
            OverheadPercentage: (OverheadPercentage),
            OverheadCombinedCost: OverheadCombinedCost,
            OverheadCombinedTotalCost: checkForNull(OverheadCombinedTotalCost * calculatePercentage(dataObj.OverheadPercentage)),
            IsOverheadCombined: true,
            IsOverheadBOPApplicable: false,
          })
          break;

        case 'CC':
          OverheadPercentage = checkForNull((dataObj.IsOverheadCombined === false) ? dataObj.OverheadCCPercentage : '')
          OverheadCombinedCost = checkForNull(assemblyLevelOperations)
          OverheadCombinedTotalCost = checkForNull(OverheadCombinedCost) * calculatePercentage(checkForNull(OverheadPercentage))

          setValue('OverheadPercentage', OverheadPercentage)
          setValue('OverheadCombinedCost', OverheadCombinedCost)
          setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(OverheadCombinedTotalCost, initialConfiguration.NoOfDecimalForPrice))

          setOverheadObj({
            ...dataObj,
            OverheadPercentage: OverheadPercentage,
            OverheadCombinedCost: OverheadCombinedCost,
            OverheadCombinedTotalCost: checkForNull(OverheadCombinedTotalCost * calculatePercentage(dataObj.OverheadPercentage)),
            IsOverheadCombined: true,
            IsOverheadCCApplicable: false,
          })
          break;

        case 'RM + CC':
          OverheadPercentage = checkForNull(dataObj.IsOverheadCombined ? dataObj.OverheadPercentage : '')
          OverheadCombinedCost = checkForNull(EditPartCost) + checkForNull(assemblyLevelOperations)
          OverheadCombinedTotalCost = checkForNull(OverheadCombinedCost) * calculatePercentage(checkForNull(OverheadPercentage))

          setValue('OverheadPercentage', OverheadPercentage)
          setValue('OverheadCombinedCost', OverheadCombinedCost)
          setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(OverheadCombinedTotalCost, initialConfiguration.NoOfDecimalForPrice))

          setOverheadObj({
            ...dataObj,
            OverheadPercentage: OverheadPercentage,
            OverheadCombinedCost: OverheadCombinedCost,
            OverheadCombinedTotalCost: OverheadCombinedTotalCost,
          })
          break;

        case 'RM + BOP':
          OverheadPercentage = checkForNull(dataObj.IsOverheadCombined ? dataObj.OverheadPercentage : '')
          OverheadCombinedCost = checkForNull(EditPartCost) + checkForNull(BOPTotalCost)
          OverheadCombinedTotalCost = checkForNull(OverheadCombinedCost) * calculatePercentage(checkForNull(OverheadPercentage))

          setValue('OverheadPercentage', OverheadPercentage)
          setValue('OverheadCombinedCost', OverheadCombinedCost)
          setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(OverheadCombinedTotalCost, initialConfiguration.NoOfDecimalForPrice))

          setOverheadObj({
            ...dataObj,
            OverheadPercentage: OverheadPercentage,
            OverheadCombinedCost: OverheadCombinedCost,
            OverheadCombinedTotalCost: OverheadCombinedTotalCost,
            // IsOverheadCombined: true,
            // IsOverheadCCApplicable: false,
          })
          break;

        case 'BOP + CC':
          OverheadPercentage = checkForNull(dataObj.IsOverheadCombined ? dataObj.OverheadPercentage : '')
          OverheadCombinedCost = checkForNull(BOPTotalCost) + checkForNull(assemblyLevelOperations)
          OverheadCombinedTotalCost = checkForNull(OverheadCombinedCost) * calculatePercentage(checkForNull(OverheadPercentage))

          setValue('OverheadPercentage', OverheadPercentage)
          setValue('OverheadCombinedCost', OverheadCombinedCost)
          setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(OverheadCombinedTotalCost, initialConfiguration.NoOfDecimalForPrice))

          setOverheadObj({
            ...dataObj,
            OverheadPercentage: OverheadPercentage,
            OverheadCombinedCost: OverheadCombinedCost,
            OverheadCombinedTotalCost: OverheadCombinedTotalCost,
            // IsOverheadCombined: true,
            // IsOverheadCCApplicable: false,
          })
          break;

        case 'RM + CC + BOP':
          OverheadPercentage = checkForNull(dataObj.IsOverheadCombined ? dataObj.OverheadPercentage : '')
          OverheadCombinedCost = checkForNull(EditPartCost) + checkForNull(assemblyLevelOperations) + checkForNull(BOPTotalCost)
          OverheadCombinedTotalCost = checkForNull(OverheadCombinedCost) * calculatePercentage(checkForNull(OverheadPercentage))

          setValue('OverheadPercentage', OverheadPercentage)
          setValue('OverheadCombinedCost', OverheadCombinedCost)
          setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(OverheadCombinedTotalCost, initialConfiguration.NoOfDecimalForPrice))

          setOverheadObj({
            ...dataObj,
            OverheadPercentage: OverheadPercentage,
            OverheadCombinedCost: OverheadCombinedCost,
            OverheadCombinedTotalCost: OverheadCombinedTotalCost,
            // IsOverheadCombined: true,
            // IsOverheadCCApplicable: false,
          })
          break;

        default:
          break;
      }
    }
  }

  const subAssemblyProfitCalc = (dataObj) => {
    if (subAssemblyTechnologyTabData) {

      const assemblyLevelOperations = checkForNull(subAssemblyTechnologyTabData && subAssemblyTechnologyTabData[0]?.processCostValue) + checkForNull(subAssemblyTechnologyTabData && subAssemblyTechnologyTabData[0]?.operationCostValue)
      const BOPTotalCost = subAssemblyTechnologyTabData && subAssemblyTechnologyTabData[0]?.CostingPartDetails?.CostPerAssemblyBOP
      const totalAssemblyCost = subAssemblyTechnologyTabData && subAssemblyTechnologyTabData[0]?.CostingPartDetails?.CostPerAssembly
      const EditPartCost = subAssemblyTechnologyTabData && subAssemblyTechnologyTabData[0]?.CostingPartDetails?.EditPartCost

      const totalCCCost = checkForNull(subAssemblyTechnologyTabData && subAssemblyTechnologyTabData[0]?.processCostValue) + checkForNull(subAssemblyTechnologyTabData && subAssemblyTechnologyTabData[0]?.operationCostValue)
      const RM_BOPCost = subAssemblyTechnologyTabData && subAssemblyTechnologyTabData[0]?.CostingPartDetails?.CostPerAssembly * calculatePercentage(dataObj.ProfitPercentage)
      const CCCost = totalCCCost * calculatePercentage((dataObj.ProfitPercentage && dataObj.ProfitPercentage !== '') ? dataObj.ProfitPercentage : 3)

      let ProfitPercentage = 0
      let ProfitCombinedCost = 0
      let ProfitCombinedTotalCost = 0

      switch (dataObj?.ProfitApplicability) {

        case 'RM':
          ProfitPercentage = checkForNull((dataObj.IsProfitCombined === false) ? dataObj.ProfitRMPercentage : '')
          ProfitCombinedCost = checkForNull(EditPartCost)
          ProfitCombinedTotalCost = checkForNull(ProfitCombinedCost) * calculatePercentage(checkForNull(ProfitPercentage))

          setValue('ProfitPercentage', ProfitPercentage)
          setValue('ProfitCombinedCost', ProfitCombinedCost)
          setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(ProfitCombinedTotalCost, initialConfiguration.NoOfDecimalForPrice))
          // ProfitPercentage = checkForNull(dataObj.ProfitRMPercentage)
          // ProfitCombinedCost = checkForNull(EditPartCost)
          // ProfitCombinedTotalCost = checkForNull(ProfitCombinedCost) * calculatePercentage(checkForNull(ProfitPercentage))

          // setValue('ProfitRMPercentage', ProfitPercentage)
          // setValue('ProfitRMCost', ProfitCombinedCost)
          // setValue('ProfitRMTotalCost', checkForDecimalAndNull(ProfitCombinedTotalCost, initialConfiguration.NoOfDecimalForPrice))

          // const objj = { 
          //   IsProfitBOPApplicable: false,
          //   IsProfitCCApplicable: false,
          //   IsProfitCombined: true,
          //   IsProfitFixedApplicable: false,
          //   IsProfitRMApplicable: false,
          //   ProfitApplicability: "RM + CC",
          //   ProfitApplicabilityId: 4,
          //   ProfitBOPCost: 0,
          //   ProfitBOPPercentage: null,
          //   ProfitBOPTotalCost: 0,
          //   ProfitCCCost: 0,
          //   ProfitCCPercentage: null,
          //   ProfitCCTotalCost: 0,
          //   ProfitCombinedCost: 0,
          //   ProfitCombinedTotalCost: 0,
          //   ProfitDetailId: null,
          //   ProfitFixedCost: 0,
          //   ProfitFixedPercentage: 0,
          //   ProfitFixedTotalCost: 0,
          //   ProfitId: "2c6ba632-0d12-4345-9021-f890f628adf5",
          //   ProfitPercentage: 5,
          //   ProfitRMCost: 0,
          //   ProfitRMPercentage: null,
          //   ProfitRMTotalCost: 0
          // }
          setProfitObj({
            ...dataObj,
            ProfitPercentage: ProfitPercentage,
            ProfitCombinedCost: ProfitCombinedCost,
            ProfitCombinedTotalCost: ProfitCombinedTotalCost,
            IsProfitCombined: true,
            IsProfitRMApplicable: false,
          })
          break;

        case 'BOP':
          ProfitPercentage = checkForNull((dataObj.IsProfitCombined === false) ? dataObj.ProfitBOPPercentage : '')
          ProfitCombinedCost = checkForNull(BOPTotalCost)
          ProfitCombinedTotalCost = checkForNull(ProfitCombinedCost) * calculatePercentage(checkForNull(ProfitPercentage))

          setValue('ProfitPercentage', (ProfitPercentage))
          setValue('ProfitCombinedCost', ProfitCombinedCost)
          setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(ProfitCombinedTotalCost, initialConfiguration.NoOfDecimalForPrice))

          setProfitObj({
            ...dataObj,
            ProfitPercentage: (ProfitPercentage),
            ProfitCombinedCost: ProfitCombinedCost,
            ProfitCombinedTotalCost: checkForNull(ProfitCombinedTotalCost * calculatePercentage(dataObj.ProfitPercentage)),
            IsProfitCombined: true,
            IsProfitBOPApplicable: false,
          })
          break;

        case 'CC':

          ProfitPercentage = checkForNull((dataObj.IsProfitCombined === false) ? dataObj.ProfitCCPercentage : '')
          ProfitCombinedCost = checkForNull(assemblyLevelOperations)
          ProfitCombinedTotalCost = checkForNull(ProfitCombinedCost) * calculatePercentage(checkForNull(ProfitPercentage))

          setValue('ProfitPercentage', ProfitPercentage)
          setValue('ProfitCombinedCost', ProfitCombinedCost)
          setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(ProfitCombinedTotalCost, initialConfiguration.NoOfDecimalForPrice))

          setProfitObj({
            ...dataObj,
            ProfitPercentage: ProfitPercentage,
            ProfitCombinedCost: ProfitCombinedCost,
            ProfitCombinedTotalCost: checkForNull(ProfitCombinedTotalCost * calculatePercentage(dataObj.ProfitPercentage)),
            IsProfitCombined: true,
            IsProfitCCApplicable: false,
          })
          break;

        case 'RM + CC':
          ProfitPercentage = checkForNull(dataObj.IsProfitCombined ? dataObj.ProfitPercentage : '')
          ProfitCombinedCost = checkForNull(EditPartCost) + checkForNull(assemblyLevelOperations)
          ProfitCombinedTotalCost = checkForNull(ProfitCombinedCost) * calculatePercentage(checkForNull(ProfitPercentage))

          setValue('ProfitPercentage', ProfitPercentage)
          setValue('ProfitCombinedCost', ProfitCombinedCost)
          setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(ProfitCombinedTotalCost, initialConfiguration.NoOfDecimalForPrice))

          setProfitObj({
            ...dataObj,
            ProfitPercentage: ProfitPercentage,
            ProfitCombinedCost: ProfitCombinedCost,
            ProfitCombinedTotalCost: ProfitCombinedTotalCost,
          })
          break;

        case 'RM + BOP':
          ProfitPercentage = checkForNull(dataObj.IsProfitCombined ? dataObj.ProfitPercentage : '')
          ProfitCombinedCost = checkForNull(EditPartCost) + checkForNull(BOPTotalCost)
          ProfitCombinedTotalCost = checkForNull(ProfitCombinedCost) * calculatePercentage(checkForNull(ProfitPercentage))

          setValue('ProfitPercentage', ProfitPercentage)
          setValue('ProfitCombinedCost', ProfitCombinedCost)
          setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(ProfitCombinedTotalCost, initialConfiguration.NoOfDecimalForPrice))

          setProfitObj({
            ...dataObj,
            ProfitPercentage: ProfitPercentage,
            ProfitCombinedCost: ProfitCombinedCost,
            ProfitCombinedTotalCost: ProfitCombinedTotalCost,
            // IsProfitCombined: true,
            // IsProfitCCApplicable: false,
          })
          break;

        case 'BOP + CC':
          ProfitPercentage = checkForNull(dataObj.IsProfitCombined ? dataObj.ProfitPercentage : '')
          ProfitCombinedCost = checkForNull(BOPTotalCost) + checkForNull(assemblyLevelOperations)
          ProfitCombinedTotalCost = checkForNull(ProfitCombinedCost) * calculatePercentage(checkForNull(ProfitPercentage))

          setValue('ProfitPercentage', ProfitPercentage)
          setValue('ProfitCombinedCost', ProfitCombinedCost)
          setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(ProfitCombinedTotalCost, initialConfiguration.NoOfDecimalForPrice))

          setProfitObj({
            ...dataObj,
            ProfitPercentage: ProfitPercentage,
            ProfitCombinedCost: ProfitCombinedCost,
            ProfitCombinedTotalCost: ProfitCombinedTotalCost,
            // IsProfitCombined: true,
            // IsProfitCCApplicable: false,
          })
          break;

        case 'RM + CC + BOP':
          ProfitPercentage = checkForNull(dataObj.IsProfitCombined ? dataObj.ProfitPercentage : '')
          ProfitCombinedCost = checkForNull(EditPartCost) + checkForNull(assemblyLevelOperations) + checkForNull(BOPTotalCost)
          ProfitCombinedTotalCost = checkForNull(ProfitCombinedCost) * calculatePercentage(checkForNull(ProfitPercentage))

          setValue('ProfitPercentage', ProfitPercentage)
          setValue('ProfitCombinedCost', ProfitCombinedCost)
          setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(ProfitCombinedTotalCost, initialConfiguration.NoOfDecimalForPrice))

          setProfitObj({
            ...dataObj,
            ProfitPercentage: ProfitPercentage,
            ProfitCombinedCost: ProfitCombinedCost,
            ProfitCombinedTotalCost: ProfitCombinedTotalCost,
            // IsProfitCombined: true,
            // IsProfitCCApplicable: false,
          })
          break;

        default:
          break;
      }
    }
  }

  /**
  * @method setOverheadValues
  * @description  SET OVERHEAD VALUES IN FIXED, COMBINED, RM, CC AND BOP
  * @description IsAPIResponse, USED TO SET FIXED VALUE IN GET ON INITIAL LOAD API CALL
  */
  const setOverheadValues = (dataObj, IsAPIResponse) => {
    if (partType) {
      if (!CostingViewMode) {
        const assemblyLevelOperations = checkForNull(subAssemblyTechnologyTabData && subAssemblyTechnologyTabData[0]?.processCostValue) + checkForNull(subAssemblyTechnologyTabData && subAssemblyTechnologyTabData[0]?.operationCostValue)
        const BOPTotalCost = subAssemblyTechnologyTabData && subAssemblyTechnologyTabData[0]?.CostingPartDetails?.CostPerAssemblyBOP
        const totalAssemblyCost = subAssemblyTechnologyTabData && subAssemblyTechnologyTabData[0]?.CostingPartDetails?.CostPerAssembly
        const EditPartCost = subAssemblyTechnologyTabData && subAssemblyTechnologyTabData[0]?.CostingPartDetails?.EditPartCost

        const totalCCCost = checkForNull(subAssemblyTechnologyTabData && subAssemblyTechnologyTabData[0]?.processCostValue) + checkForNull(subAssemblyTechnologyTabData && subAssemblyTechnologyTabData[0]?.operationCostValue)
        const RM_BOPCost = subAssemblyTechnologyTabData && subAssemblyTechnologyTabData[0]?.CostingPartDetails?.CostPerAssembly * calculatePercentage(dataObj.OverheadPercentage)
        const CCCost = totalCCCost * calculatePercentage((dataObj.OverheadPercentage && dataObj.OverheadPercentage !== '') ? dataObj.OverheadPercentage : 3)

        let OverheadRMCost = EditPartCost              //LATER headerCosts.NetRawMaterialsCost
        let OverheadCCCost = assemblyLevelOperations              //LATER headerCosts.ProcessCostTotal
        let OverheadBOPCost = BOPTotalCost              //LATER headerCosts.ProcessCostTotal

        let OverheadRMPercentage = dataObj.IsOverheadRMApplicable ? dataObj.OverheadRMPercentage : ''
        let OverheadRMTotalCost = OverheadRMCost * calculatePercentage(OverheadRMPercentage)

        let OverheadBOPPercentage = dataObj.IsOverheadBOPApplicable ? dataObj.OverheadBOPPercentage : ''
        let OverheadBOPTotalCost = OverheadBOPCost * calculatePercentage(OverheadBOPPercentage)

        let OverheadCCPercentage = dataObj.IsOverheadCCApplicable ? dataObj.OverheadCCPercentage : ''
        let OverheadCCTotalCost = OverheadCCCost * calculatePercentage(OverheadCCPercentage)

        const { IsCutOffApplicable, CutOffRMC } = RMCCutOffObj;

        if (dataObj.IsOverheadFixedApplicable && IsAPIResponse === false) {

          setValue('OverheadFixedPercentage', dataObj.IsOverheadFixedApplicable ? dataObj.OverheadFixedPercentage : '')
          setValue('OverheadFixedCost', '-')
          setValue('OverheadFixedTotalCost', dataObj.IsOverheadFixedApplicable ? checkForDecimalAndNull(dataObj.OverheadFixedPercentage, initialConfiguration.NoOfDecimalForPrice) : '')
          setOverheadObj({
            ...overheadObj,
            OverheadFixedPercentage: dataObj.OverheadFixedPercentage,
            OverheadFixedCost: '-',
            OverheadFixedTotalCost: dataObj.OverheadFixedPercentage,
          })
        }

        if (dataObj.IsOverheadCombined && IsAPIResponse === false) {

          const RMBOPCC = headerCosts.NetBoughtOutPartCost + headerCosts.NetRawMaterialsCost + headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal
          const CutOffRMBOPCCTotal = IsCutOffApplicable && headerCosts ? CutOffRMC + headerCosts.NetBoughtOutPartCost + (headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal) : RMBOPCC; //NEED TO ASK FOR YHIS PART
          setValue('OverheadPercentage', dataObj.IsOverheadCombined ? dataObj.OverheadPercentage : '')
          setValue('OverheadCombinedCost', headerCosts && checkForDecimalAndNull(CutOffRMBOPCCTotal, initialConfiguration.NoOfDecimalForPrice))
          setValue('OverheadCombinedTotalCost', checkForDecimalAndNull((CutOffRMBOPCCTotal * calculatePercentage(dataObj.OverheadPercentage)), initialConfiguration.NoOfDecimalForPrice))
          setOverheadObj({
            ...overheadObj,
            OverheadPercentage: dataObj.OverheadPercentage,
            OverheadCombinedCost: headerCosts && checkForNull(CutOffRMBOPCCTotal),
            OverheadCombinedTotalCost: checkForNull(CutOffRMBOPCCTotal * calculatePercentage(dataObj.OverheadPercentage)),
          })
        }
        // COMBINED(TRIPLE)   //DONE
        if (dataObj.IsOverheadRMApplicable && dataObj.IsOverheadBOPApplicable && dataObj.IsOverheadCCApplicable) {      //DONE

          setValue('OverheadRMPercentage', OverheadRMPercentage)
          setValue('OverheadRMCost', checkForDecimalAndNull(OverheadRMCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('OverheadRMTotalCost', checkForDecimalAndNull(OverheadRMTotalCost, initialConfiguration.NoOfDecimalForPrice))

          setValue('OverheadBOPPercentage', OverheadBOPPercentage)
          setValue('OverheadBOPCost', checkForDecimalAndNull(OverheadBOPCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('OverheadBOPTotalCost', checkForDecimalAndNull(OverheadBOPTotalCost, initialConfiguration.NoOfDecimalForPrice))

          setValue('OverheadCCPercentage', OverheadCCPercentage)
          setValue('OverheadCCCost', checkForDecimalAndNull(OverheadCCCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('OverheadCCTotalCost', checkForDecimalAndNull(OverheadCCTotalCost, initialConfiguration.NoOfDecimalForPrice))

          setTempOverheadObj({
            ...tempOverheadObj,
            OverheadRMPercentage: dataObj.OverheadRMPercentage,
            OverheadRMCost: IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost,
            OverheadRMTotalCost: OverheadRMTotalCost,

            OverheadBOPPercentage: OverheadBOPPercentage,
            OverheadBOPCost: OverheadBOPCost,
            OverheadBOPTotalCost: OverheadBOPTotalCost,

            OverheadCCPercentage: OverheadCCPercentage,
            OverheadCCCost: OverheadCCCost,
            OverheadCCTotalCost: OverheadCCTotalCost,
          })
        }

        // SINGLE             //DONE
        if (dataObj.IsOverheadRMApplicable && !dataObj.IsOverheadBOPApplicable && !dataObj.IsOverheadCCApplicable) {    //DONE
          setValue('OverheadRMPercentage', OverheadRMPercentage)
          setValue('OverheadRMCost', checkForDecimalAndNull(OverheadRMCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('OverheadRMTotalCost', checkForDecimalAndNull(OverheadRMTotalCost, initialConfiguration.NoOfDecimalForPrice))
          setTempOverheadObj({
            ...tempOverheadObj,
            OverheadRMPercentage: dataObj.OverheadRMPercentage,
            OverheadRMCost: IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost,
            OverheadRMTotalCost: OverheadRMTotalCost
          })
        }

        if (dataObj.IsOverheadBOPApplicable && !dataObj.IsOverheadRMApplicable && !dataObj.IsOverheadCCApplicable) {    //DONE
          setValue('OverheadBOPPercentage', OverheadBOPPercentage)
          setValue('OverheadBOPCost', checkForDecimalAndNull(OverheadBOPCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('OverheadBOPTotalCost', checkForDecimalAndNull(OverheadBOPTotalCost, initialConfiguration.NoOfDecimalForPrice))

          setTempOverheadObj({
            ...tempOverheadObj,
            OverheadBOPPercentage: OverheadBOPPercentage,
            OverheadBOPCost: OverheadBOPCost,
            OverheadBOPTotalCost: OverheadBOPTotalCost,
          })
        }

        if (dataObj.IsOverheadCCApplicable && !dataObj.IsOverheadBOPApplicable && !dataObj.IsOverheadRMApplicable) {    //DONE
          setValue('OverheadCCPercentage', OverheadCCPercentage)
          setValue('OverheadCCCost', checkForDecimalAndNull(OverheadCCCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('OverheadCCTotalCost', checkForDecimalAndNull(OverheadCCTotalCost, initialConfiguration.NoOfDecimalForPrice))

          setTempOverheadObj({
            ...tempOverheadObj,
            OverheadCCPercentage: OverheadCCPercentage,
            OverheadCCCost: OverheadCCCost,
            OverheadCCTotalCost: OverheadCCTotalCost,
          })
        }
        //COMBINED(DOUBLE)    //DONE
        if (dataObj.IsOverheadRMApplicable && dataObj.IsOverheadCCApplicable && !dataObj.IsOverheadBOPApplicable) {     //DONE
          setValue('OverheadRMPercentage', OverheadRMPercentage)
          setValue('OverheadRMCost', checkForDecimalAndNull(OverheadRMCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('OverheadRMTotalCost', checkForDecimalAndNull(OverheadRMTotalCost, initialConfiguration.NoOfDecimalForPrice))

          setValue('OverheadCCPercentage', OverheadCCPercentage)
          setValue('OverheadCCCost', checkForDecimalAndNull(OverheadCCCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('OverheadCCTotalCost', checkForDecimalAndNull(OverheadCCTotalCost, initialConfiguration.NoOfDecimalForPrice))

          setTempOverheadObj({
            ...tempOverheadObj,
            OverheadCCPercentage: OverheadCCPercentage,
            OverheadCCCost: OverheadCCCost,
            OverheadCCTotalCost: OverheadCCTotalCost,

            OverheadRMPercentage: OverheadRMPercentage,
            OverheadRMCost: OverheadRMCost,
            OverheadRMTotalCost: OverheadRMTotalCost
          })
        }
        if (dataObj.IsOverheadRMApplicable && dataObj.IsOverheadBOPApplicable && !dataObj.IsOverheadCCApplicable) {     //DONE
          setValue('OverheadRMPercentage', OverheadRMPercentage)
          setValue('OverheadRMCost', checkForDecimalAndNull(OverheadRMCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('OverheadRMTotalCost', checkForDecimalAndNull(OverheadRMTotalCost, initialConfiguration.NoOfDecimalForPrice))

          setValue('OverheadBOPPercentage', OverheadBOPPercentage)
          setValue('OverheadBOPCost', checkForDecimalAndNull(OverheadBOPCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('OverheadBOPTotalCost', checkForDecimalAndNull(OverheadBOPTotalCost, initialConfiguration.NoOfDecimalForPrice))

          setTempOverheadObj({
            ...tempOverheadObj,
            OverheadBOPPercentage: OverheadBOPPercentage,
            OverheadBOPCost: OverheadBOPCost,
            OverheadBOPTotalCost: OverheadBOPTotalCost,

            OverheadRMPercentage: OverheadRMPercentage,
            OverheadRMCost: OverheadRMCost,
            OverheadRMTotalCost: OverheadRMTotalCost
          })
        }
        if (dataObj.IsOverheadBOPApplicable && dataObj.IsOverheadCCApplicable && !dataObj.IsOverheadRMApplicable) {     //DONE
          setValue('OverheadBOPPercentage', OverheadBOPPercentage)
          setValue('OverheadBOPCost', checkForDecimalAndNull(OverheadBOPCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('OverheadBOPTotalCost', checkForDecimalAndNull(OverheadBOPTotalCost, initialConfiguration.NoOfDecimalForPrice))

          setValue('OverheadCCPercentage', OverheadCCPercentage)
          setValue('OverheadCCCost', checkForDecimalAndNull(OverheadCCCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('OverheadCCTotalCost', checkForDecimalAndNull(OverheadCCTotalCost, initialConfiguration.NoOfDecimalForPrice))

          setTempOverheadObj({
            ...tempOverheadObj,
            OverheadBOPPercentage: OverheadBOPPercentage,
            OverheadBOPCost: OverheadBOPCost,
            OverheadBOPTotalCost: OverheadBOPTotalCost,

            OverheadCCPercentage: OverheadCCPercentage,
            OverheadCCCost: OverheadCCCost,
            OverheadCCTotalCost: OverheadCCTotalCost,
          })
        }
      }
      // subAssemblyOverheadCalc(dataObj)
    } else {
      if (!CostingViewMode) {

        const { IsCutOffApplicable, CutOffRMC } = RMCCutOffObj;

        if (dataObj.IsOverheadFixedApplicable && IsAPIResponse === false) {

          setValue('OverheadFixedPercentage', dataObj.IsOverheadFixedApplicable ? dataObj.OverheadFixedPercentage : '')
          setValue('OverheadFixedCost', '-')
          setValue('OverheadFixedTotalCost', dataObj.IsOverheadFixedApplicable ? checkForDecimalAndNull(dataObj.OverheadFixedPercentage, initialConfiguration.NoOfDecimalForPrice) : '')
          setOverheadObj({
            ...overheadObj,
            OverheadFixedPercentage: dataObj.OverheadFixedPercentage,
            OverheadFixedCost: '-',
            OverheadFixedTotalCost: dataObj.OverheadFixedPercentage,
          })
        }

        if (dataObj.IsOverheadCombined && IsAPIResponse === false) {

          const RMBOPCC = headerCosts.NetBoughtOutPartCost + headerCosts.NetRawMaterialsCost + headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal
          const CutOffRMBOPCCTotal = IsCutOffApplicable && headerCosts ? CutOffRMC + headerCosts.NetBoughtOutPartCost + (headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal) : RMBOPCC; //NEED TO ASK FOR YHIS PART
          setValue('OverheadPercentage', dataObj.IsOverheadCombined ? dataObj.OverheadPercentage : '')
          setValue('OverheadCombinedCost', headerCosts && checkForDecimalAndNull(CutOffRMBOPCCTotal, initialConfiguration.NoOfDecimalForPrice))
          setValue('OverheadCombinedTotalCost', checkForDecimalAndNull((CutOffRMBOPCCTotal * calculatePercentage(dataObj.OverheadPercentage)), initialConfiguration.NoOfDecimalForPrice))
          setOverheadObj({
            ...overheadObj,
            OverheadPercentage: dataObj.OverheadPercentage,
            OverheadCombinedCost: headerCosts && checkForNull(CutOffRMBOPCCTotal),
            OverheadCombinedTotalCost: checkForNull(CutOffRMBOPCCTotal * calculatePercentage(dataObj.OverheadPercentage)),
          })
        }

        if (dataObj.IsOverheadRMApplicable && dataObj.IsOverheadBOPApplicable && dataObj.IsOverheadCCApplicable) {
          //RM
          setValue('OverheadRMPercentage', dataObj.OverheadRMPercentage)
          setValue('OverheadRMCost', IsCutOffApplicable ? checkForDecimalAndNull(CutOffRMC, initialConfiguration.NoOfDecimalForPrice) : checkForDecimalAndNull(headerCosts.NetRawMaterialsCost, initialConfiguration.NoOfDecimalForPrice))
          const totalOverheadCostRM = IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost * calculatePercentage(dataObj.OverheadRMPercentage)
          setValue('OverheadRMTotalCost', checkForDecimalAndNull(totalOverheadCostRM, initialConfiguration.NoOfDecimalForPrice))
          //BOP
          setValue('OverheadBOPPercentage', dataObj.IsOverheadBOPApplicable ? dataObj.OverheadBOPPercentage : '')
          setValue('OverheadBOPCost', checkForDecimalAndNull(headerCosts && headerCosts.NetBoughtOutPartCost, initialConfiguration.NoOfDecimalForPrice))
          const totalOverheadCostBOP = headerCosts.NetBoughtOutPartCost * calculatePercentage(dataObj.OverheadBOPPercentage)
          setValue('OverheadBOPTotalCost', checkForDecimalAndNull(totalOverheadCostBOP, initialConfiguration.NoOfDecimalForPrice))

          //CC
          setValue('OverheadCCPercentage', dataObj.IsOverheadCCApplicable ? dataObj.OverheadCCPercentage : '')
          setValue('OverheadCCCost', headerCosts && checkForDecimalAndNull(headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal, initialConfiguration.NoOfDecimalForPrice))
          const totalOverheadCostCC = headerCosts && (headerCosts?.ProcessCostTotal + headerCosts?.OperationCostTotal) * calculatePercentage(dataObj?.OverheadCCPercentage)
          setValue('OverheadCCTotalCost', checkForDecimalAndNull(totalOverheadCostCC, initialConfiguration.NoOfDecimalForPrice))

          setTempOverheadObj({
            ...tempOverheadObj,
            OverheadRMPercentage: dataObj.OverheadRMPercentage,
            OverheadRMCost: IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost,
            OverheadRMTotalCost: totalOverheadCostRM,
            OverheadBOPPercentage: dataObj.OverheadBOPPercentage,
            OverheadBOPCost: headerCosts.NetBoughtOutPartCost,
            OverheadBOPTotalCost: totalOverheadCostBOP,
            OverheadCCPercentage: dataObj.OverheadCCPercentage,
            OverheadCCCost: headerCosts && headerCosts?.ProcessCostTotal + headerCosts?.OperationCostTotal,
            OverheadCCTotalCost: totalOverheadCostCC
          })
        }

        if (dataObj.IsOverheadRMApplicable && !dataObj.IsOverheadBOPApplicable && !dataObj.IsOverheadCCApplicable) {

          setValue('OverheadRMPercentage', dataObj.OverheadRMPercentage)
          setValue('OverheadRMCost', IsCutOffApplicable ? checkForDecimalAndNull(CutOffRMC, initialConfiguration.NoOfDecimalForPrice) : checkForDecimalAndNull(headerCosts.NetRawMaterialsCost, initialConfiguration.NoOfDecimalForPrice))
          const totalOverheadCost = IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost * calculatePercentage(dataObj.OverheadRMPercentage)
          setValue('OverheadRMTotalCost', checkForDecimalAndNull(totalOverheadCost, initialConfiguration.NoOfDecimalForPrice))
          setTempOverheadObj({
            ...tempOverheadObj,
            OverheadRMPercentage: dataObj.OverheadRMPercentage,
            OverheadRMCost: IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost,
            OverheadRMTotalCost: totalOverheadCost
          })
        }

        if (dataObj.IsOverheadBOPApplicable && !dataObj.IsOverheadRMApplicable && !dataObj.IsOverheadCCApplicable) {
          setValue('OverheadBOPPercentage', dataObj.IsOverheadBOPApplicable ? dataObj.OverheadBOPPercentage : '')
          setValue('OverheadBOPCost', checkForDecimalAndNull(headerCosts && headerCosts.NetBoughtOutPartCost, initialConfiguration.NoOfDecimalForPrice))
          const totalOverheadCost = headerCosts.NetBoughtOutPartCost * calculatePercentage(dataObj.OverheadBOPPercentage)
          setValue('OverheadBOPTotalCost', checkForDecimalAndNull(totalOverheadCost, initialConfiguration.NoOfDecimalForPrice))
          setTempOverheadObj({
            ...tempOverheadObj,
            OverheadBOPPercentage: dataObj.OverheadBOPPercentage,
            OverheadBOPCost: headerCosts.NetBoughtOutPartCost,
            OverheadBOPTotalCost: totalOverheadCost
          })
        }

        if (dataObj.IsOverheadCCApplicable && !dataObj.IsOverheadBOPApplicable && !dataObj.IsOverheadRMApplicable) {
          setValue('OverheadCCPercentage', dataObj.IsOverheadCCApplicable ? dataObj.OverheadCCPercentage : '')
          setValue('OverheadCCCost', headerCosts && checkForDecimalAndNull(headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal, initialConfiguration.NoOfDecimalForPrice))
          const totalOverheadCost = headerCosts && (headerCosts?.ProcessCostTotal + headerCosts?.OperationCostTotal) * calculatePercentage(dataObj?.OverheadCCPercentage)
          setValue('OverheadCCTotalCost', checkForDecimalAndNull(totalOverheadCost, initialConfiguration.NoOfDecimalForPrice))
          setTempOverheadObj({
            ...tempOverheadObj,
            OverheadCCPercentage: dataObj.OverheadCCPercentage,
            OverheadCCCost: headerCosts && headerCosts?.ProcessCostTotal + headerCosts?.OperationCostTotal,
            OverheadCCTotalCost: totalOverheadCost
          })
        }

        if (dataObj.IsOverheadRMApplicable && dataObj.IsOverheadCCApplicable && !dataObj.IsOverheadBOPApplicable) {
          setValue('OverheadRMPercentage', dataObj.OverheadRMPercentage)
          setValue('OverheadRMCost', IsCutOffApplicable ? checkForDecimalAndNull(CutOffRMC, initialConfiguration.NoOfDecimalForPrice) : checkForDecimalAndNull(headerCosts.NetRawMaterialsCost, initialConfiguration.NoOfDecimalForPrice))
          const totalOverheadRMCost = IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost * calculatePercentage(dataObj.OverheadRMPercentage)
          setValue('OverheadRMTotalCost', checkForDecimalAndNull(totalOverheadRMCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('OverheadCCPercentage', dataObj.IsOverheadCCApplicable ? dataObj.OverheadCCPercentage : '')
          setValue('OverheadCCCost', headerCosts && checkForDecimalAndNull(headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal, initialConfiguration.NoOfDecimalForPrice))
          const totalOverheadCCCost = headerCosts && (headerCosts?.ProcessCostTotal + headerCosts?.OperationCostTotal) * calculatePercentage(dataObj?.OverheadCCPercentage)
          setValue('OverheadCCTotalCost', checkForDecimalAndNull(totalOverheadCCCost, initialConfiguration.NoOfDecimalForPrice))
          setTempOverheadObj({
            ...tempOverheadObj,
            OverheadCCPercentage: dataObj.OverheadCCPercentage,
            OverheadCCCost: headerCosts && headerCosts?.ProcessCostTotal + headerCosts?.OperationCostTotal,
            OverheadCCTotalCost: totalOverheadCCCost,
            OverheadRMPercentage: dataObj.OverheadRMPercentage,
            OverheadRMCost: IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost,
            OverheadRMTotalCost: totalOverheadRMCost
          })
        }
        if (dataObj.IsOverheadRMApplicable && dataObj.IsOverheadBOPApplicable && !dataObj.IsOverheadCCApplicable) {

          setValue('OverheadRMPercentage', dataObj.OverheadRMPercentage)
          setValue('OverheadRMCost', IsCutOffApplicable ? checkForDecimalAndNull(CutOffRMC, initialConfiguration.NoOfDecimalForPrice) : checkForDecimalAndNull(headerCosts.NetRawMaterialsCost, initialConfiguration.NoOfDecimalForPrice))
          const totalOverheadRMCost = IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost * calculatePercentage(dataObj.OverheadRMPercentage)
          setValue('OverheadRMTotalCost', checkForDecimalAndNull(totalOverheadRMCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('OverheadBOPPercentage', dataObj.IsOverheadBOPApplicable ? dataObj.OverheadBOPPercentage : '')
          setValue('OverheadBOPCost', checkForDecimalAndNull(headerCosts && headerCosts.NetBoughtOutPartCost, initialConfiguration.NoOfDecimalForPrice))
          const totalOverheadBOPCost = headerCosts.NetBoughtOutPartCost * calculatePercentage(dataObj.OverheadBOPPercentage)
          setValue('OverheadBOPTotalCost', checkForDecimalAndNull(totalOverheadBOPCost, initialConfiguration.NoOfDecimalForPrice))
          setTempOverheadObj({
            ...tempOverheadObj,
            OverheadBOPPercentage: dataObj.OverheadBOPPercentage,
            OverheadBOPCost: IsCutOffApplicable ? CutOffRMC : headerCosts.NetBoughtOutPartCost,
            OverheadBOPTotalCost: totalOverheadBOPCost,
            OverheadRMPercentage: dataObj.OverheadRMPercentage,
            OverheadRMCost: IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost,
            OverheadRMTotalCost: totalOverheadRMCost
          })
        }
        if (dataObj.IsOverheadBOPApplicable && dataObj.IsOverheadCCApplicable && !dataObj.IsOverheadRMApplicable) {

          setValue('OverheadBOPPercentage', dataObj.IsOverheadBOPApplicable ? dataObj.OverheadBOPPercentage : '')
          setValue('OverheadBOPCost', checkForDecimalAndNull(headerCosts && headerCosts.NetBoughtOutPartCost, initialConfiguration.NoOfDecimalForPrice))
          const totalOverheadBOPCost = headerCosts.NetBoughtOutPartCost * calculatePercentage(dataObj.OverheadBOPPercentage)
          setValue('OverheadBOPTotalCost', checkForDecimalAndNull(totalOverheadBOPCost, initialConfiguration.NoOfDecimalForPrice))

          setValue('OverheadCCPercentage', dataObj.IsOverheadCCApplicable ? dataObj.OverheadCCPercentage : '')
          setValue('OverheadCCCost', headerCosts && checkForDecimalAndNull(headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal, initialConfiguration.NoOfDecimalForPrice))
          const totalOverheadCCCost = headerCosts && (headerCosts?.ProcessCostTotal + headerCosts?.OperationCostTotal) * calculatePercentage(dataObj?.OverheadCCPercentage)
          setValue('OverheadCCTotalCost', checkForDecimalAndNull(totalOverheadCCCost, initialConfiguration.NoOfDecimalForPrice))
          setTempOverheadObj({
            ...tempOverheadObj,
            OverheadCCPercentage: dataObj.OverheadCCPercentage,
            OverheadCCCost: headerCosts && headerCosts?.ProcessCostTotal + headerCosts?.OperationCostTotal,
            OverheadCCTotalCost: totalOverheadCCCost,
            OverheadBOPPercentage: dataObj.OverheadBOPPercentage,
            OverheadBOPCost: IsCutOffApplicable ? CutOffRMC : headerCosts.NetBoughtOutPartCost,
            OverheadBOPTotalCost: totalOverheadBOPCost,
          })
        }
      }
    }
  }

  /**
  * @method setProfitValues
  * @description  SET PROFIT VALUES IN FIXED, COMBINED, RM, CC AND FIXED
  */
  const setProfitValues = (dataObj, IsAPIResponse) => {
    if (partType) {
      if (!CostingViewMode) {
        const assemblyLevelOperations = checkForNull(subAssemblyTechnologyTabData && subAssemblyTechnologyTabData[0]?.processCostValue) + checkForNull(subAssemblyTechnologyTabData && subAssemblyTechnologyTabData[0]?.operationCostValue)
        const BOPTotalCost = subAssemblyTechnologyTabData && subAssemblyTechnologyTabData[0]?.CostingPartDetails?.CostPerAssemblyBOP
        const totalAssemblyCost = subAssemblyTechnologyTabData && subAssemblyTechnologyTabData[0]?.CostingPartDetails?.CostPerAssembly
        const EditPartCost = subAssemblyTechnologyTabData && subAssemblyTechnologyTabData[0]?.CostingPartDetails?.EditPartCost

        const totalCCCost = checkForNull(subAssemblyTechnologyTabData && subAssemblyTechnologyTabData[0]?.processCostValue) + checkForNull(subAssemblyTechnologyTabData && subAssemblyTechnologyTabData[0]?.operationCostValue)
        const RM_BOPCost = subAssemblyTechnologyTabData && subAssemblyTechnologyTabData[0]?.CostingPartDetails?.CostPerAssembly * calculatePercentage(dataObj.ProfitPercentage)
        const CCCost = totalCCCost * calculatePercentage((dataObj.ProfitPercentage && dataObj.ProfitPercentage !== '') ? dataObj.ProfitPercentage : 3)

        let ProfitRMCost = EditPartCost              //LATER headerCosts.NetRawMaterialsCost
        let ProfitCCCost = assemblyLevelOperations              //LATER headerCosts.ProcessCostTotal
        let ProfitBOPCost = BOPTotalCost              //LATER headerCosts.ProcessCostTotal

        let ProfitRMPercentage = dataObj.IsProfitRMApplicable ? dataObj.ProfitRMPercentage : ''
        let ProfitRMTotalCost = ProfitRMCost * calculatePercentage(ProfitRMPercentage)

        let ProfitBOPPercentage = dataObj.IsProfitBOPApplicable ? dataObj.ProfitBOPPercentage : ''
        let ProfitBOPTotalCost = ProfitBOPCost * calculatePercentage(ProfitBOPPercentage)

        let ProfitCCPercentage = dataObj.IsProfitCCApplicable ? dataObj.ProfitCCPercentage : ''
        let ProfitCCTotalCost = ProfitCCCost * calculatePercentage(ProfitCCPercentage)

        const { IsCutOffApplicable, CutOffRMC } = RMCCutOffObj;

        if (dataObj.IsProfitFixedApplicable && IsAPIResponse === false) {

          setValue('ProfitFixedPercentage', dataObj.IsProfitFixedApplicable ? dataObj.ProfitFixedPercentage : '')
          setValue('ProfitFixedCost', '-')
          setValue('ProfitFixedTotalCost', dataObj.IsProfitFixedApplicable ? checkForDecimalAndNull(dataObj.ProfitFixedPercentage, initialConfiguration.NoOfDecimalForPrice) : '')
          setProfitObj({
            ...profitObj,
            ProfitFixedPercentage: dataObj.ProfitFixedPercentage,
            ProfitFixedCost: '-',
            ProfitFixedTotalCost: dataObj.ProfitFixedPercentage,
          })
        }

        if (dataObj.IsProfitCombined && IsAPIResponse === false) {

          const RMBOPCC = headerCosts.NetBoughtOutPartCost + headerCosts.NetRawMaterialsCost + headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal
          const CutOffRMBOPCCTotal = IsCutOffApplicable && headerCosts ? CutOffRMC + headerCosts.NetBoughtOutPartCost + (headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal) : RMBOPCC; //NEED TO ASK FOR YHIS PART
          setValue('ProfitPercentage', dataObj.IsProfitCombined ? dataObj.ProfitPercentage : '')
          setValue('ProfitCombinedCost', headerCosts && checkForDecimalAndNull(CutOffRMBOPCCTotal, initialConfiguration.NoOfDecimalForPrice))
          setValue('ProfitCombinedTotalCost', checkForDecimalAndNull((CutOffRMBOPCCTotal * calculatePercentage(dataObj.ProfitPercentage)), initialConfiguration.NoOfDecimalForPrice))
          setProfitObj({
            ...profitObj,
            ProfitPercentage: dataObj.ProfitPercentage,
            ProfitCombinedCost: headerCosts && checkForNull(CutOffRMBOPCCTotal),
            ProfitCombinedTotalCost: checkForNull(CutOffRMBOPCCTotal * calculatePercentage(dataObj.ProfitPercentage)),
          })
        }
        // COMBINED(TRIPLE)   //DONE
        if (dataObj.IsProfitRMApplicable && dataObj.IsProfitBOPApplicable && dataObj.IsProfitCCApplicable) {      //DONE

          setValue('ProfitRMPercentage', ProfitRMPercentage)
          setValue('ProfitRMCost', checkForDecimalAndNull(ProfitRMCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('ProfitRMTotalCost', checkForDecimalAndNull(ProfitRMTotalCost, initialConfiguration.NoOfDecimalForPrice))

          setValue('ProfitBOPPercentage', ProfitBOPPercentage)
          setValue('ProfitBOPCost', checkForDecimalAndNull(ProfitBOPCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('ProfitBOPTotalCost', checkForDecimalAndNull(ProfitBOPTotalCost, initialConfiguration.NoOfDecimalForPrice))

          setValue('ProfitCCPercentage', ProfitCCPercentage)
          setValue('ProfitCCCost', checkForDecimalAndNull(ProfitCCCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('ProfitCCTotalCost', checkForDecimalAndNull(ProfitCCTotalCost, initialConfiguration.NoOfDecimalForPrice))

          setTempProfitObj({
            ...tempProfitObj,
            ProfitRMPercentage: dataObj.ProfitRMPercentage,
            ProfitRMCost: IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost,
            ProfitRMTotalCost: ProfitRMTotalCost,

            ProfitBOPPercentage: ProfitBOPPercentage,
            ProfitBOPCost: ProfitBOPCost,
            ProfitBOPTotalCost: ProfitBOPTotalCost,

            ProfitCCPercentage: ProfitCCPercentage,
            ProfitCCCost: ProfitCCCost,
            ProfitCCTotalCost: ProfitCCTotalCost,
          })
        }

        // SINGLE             //DONE
        if (dataObj.IsProfitRMApplicable && !dataObj.IsProfitBOPApplicable && !dataObj.IsProfitCCApplicable) {    //DONE
          setValue('ProfitRMPercentage', ProfitRMPercentage)
          setValue('ProfitRMCost', checkForDecimalAndNull(ProfitRMCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('ProfitRMTotalCost', checkForDecimalAndNull(ProfitRMTotalCost, initialConfiguration.NoOfDecimalForPrice))
          setTempProfitObj({
            ...tempProfitObj,
            ProfitRMPercentage: dataObj.ProfitRMPercentage,
            ProfitRMCost: IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost,
            ProfitRMTotalCost: ProfitRMTotalCost
          })
        }

        if (dataObj.IsProfitBOPApplicable && !dataObj.IsProfitRMApplicable && !dataObj.IsProfitCCApplicable) {    //DONE
          setValue('ProfitBOPPercentage', ProfitBOPPercentage)
          setValue('ProfitBOPCost', checkForDecimalAndNull(ProfitBOPCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('ProfitBOPTotalCost', checkForDecimalAndNull(ProfitBOPTotalCost, initialConfiguration.NoOfDecimalForPrice))

          setTempProfitObj({
            ...tempProfitObj,
            ProfitBOPPercentage: ProfitBOPPercentage,
            ProfitBOPCost: ProfitBOPCost,
            ProfitBOPTotalCost: ProfitBOPTotalCost,
          })
        }

        if (dataObj.IsProfitCCApplicable && !dataObj.IsProfitBOPApplicable && !dataObj.IsProfitRMApplicable) {    //DONE
          setValue('ProfitCCPercentage', ProfitCCPercentage)
          setValue('ProfitCCCost', checkForDecimalAndNull(ProfitCCCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('ProfitCCTotalCost', checkForDecimalAndNull(ProfitCCTotalCost, initialConfiguration.NoOfDecimalForPrice))

          setTempProfitObj({
            ...tempProfitObj,
            ProfitCCPercentage: ProfitCCPercentage,
            ProfitCCCost: ProfitCCCost,
            ProfitCCTotalCost: ProfitCCTotalCost,
          })
        }
        //COMBINED(DOUBLE)    //DONE
        if (dataObj.IsProfitRMApplicable && dataObj.IsProfitCCApplicable && !dataObj.IsProfitBOPApplicable) {     //DONE
          setValue('ProfitRMPercentage', ProfitRMPercentage)
          setValue('ProfitRMCost', checkForDecimalAndNull(ProfitRMCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('ProfitRMTotalCost', checkForDecimalAndNull(ProfitRMTotalCost, initialConfiguration.NoOfDecimalForPrice))

          setValue('ProfitCCPercentage', ProfitCCPercentage)
          setValue('ProfitCCCost', checkForDecimalAndNull(ProfitCCCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('ProfitCCTotalCost', checkForDecimalAndNull(ProfitCCTotalCost, initialConfiguration.NoOfDecimalForPrice))

          setTempProfitObj({
            ...tempProfitObj,
            ProfitCCPercentage: ProfitCCPercentage,
            ProfitCCCost: ProfitCCCost,
            ProfitCCTotalCost: ProfitCCTotalCost,

            ProfitRMPercentage: ProfitRMPercentage,
            ProfitRMCost: ProfitRMCost,
            ProfitRMTotalCost: ProfitRMTotalCost
          })
        }
        if (dataObj.IsProfitRMApplicable && dataObj.IsProfitBOPApplicable && !dataObj.IsProfitCCApplicable) {     //DONE
          setValue('ProfitRMPercentage', ProfitRMPercentage)
          setValue('ProfitRMCost', checkForDecimalAndNull(ProfitRMCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('ProfitRMTotalCost', checkForDecimalAndNull(ProfitRMTotalCost, initialConfiguration.NoOfDecimalForPrice))

          setValue('ProfitBOPPercentage', ProfitBOPPercentage)
          setValue('ProfitBOPCost', checkForDecimalAndNull(ProfitBOPCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('ProfitBOPTotalCost', checkForDecimalAndNull(ProfitBOPTotalCost, initialConfiguration.NoOfDecimalForPrice))

          setTempProfitObj({
            ...tempProfitObj,
            ProfitBOPPercentage: ProfitBOPPercentage,
            ProfitBOPCost: ProfitBOPCost,
            ProfitBOPTotalCost: ProfitBOPTotalCost,

            ProfitRMPercentage: ProfitRMPercentage,
            ProfitRMCost: ProfitRMCost,
            ProfitRMTotalCost: ProfitRMTotalCost
          })
        }
        if (dataObj.IsProfitBOPApplicable && dataObj.IsProfitCCApplicable && !dataObj.IsProfitRMApplicable) {     //DONE
          setValue('ProfitBOPPercentage', ProfitBOPPercentage)
          setValue('ProfitBOPCost', checkForDecimalAndNull(ProfitBOPCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('ProfitBOPTotalCost', checkForDecimalAndNull(ProfitBOPTotalCost, initialConfiguration.NoOfDecimalForPrice))

          setValue('ProfitCCPercentage', ProfitCCPercentage)
          setValue('ProfitCCCost', checkForDecimalAndNull(ProfitCCCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('ProfitCCTotalCost', checkForDecimalAndNull(ProfitCCTotalCost, initialConfiguration.NoOfDecimalForPrice))

          setTempProfitObj({
            ...tempProfitObj,
            ProfitBOPPercentage: ProfitBOPPercentage,
            ProfitBOPCost: ProfitBOPCost,
            ProfitBOPTotalCost: ProfitBOPTotalCost,

            ProfitCCPercentage: ProfitCCPercentage,
            ProfitCCCost: ProfitCCCost,
            ProfitCCTotalCost: ProfitCCTotalCost,
          })
        }
      }
      // subAssemblyProfitCalc(dataObj)
    } else {
      if (!CostingViewMode) {
        let profitTotalCost = 0
        const { IsCutOffApplicable, CutOffRMC } = RMCCutOffObj;
        const RMBOPCC = headerCosts.NetRawMaterialsCost + headerCosts.NetBoughtOutPartCost + headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal
        const CutOffRMBOPCCTotal = IsCutOffApplicable && headerCosts ? CutOffRMC + headerCosts.NetBoughtOutPartCost + headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal : RMBOPCC; //NEED TO ASK HERE ALSO

        if (dataObj.IsProfitFixedApplicable && IsAPIResponse === false) {
          setValue('ProfitFixedPercentage', dataObj.IsProfitFixedApplicable ? dataObj.ProfitFixedPercentage : '')
          setValue('ProfitFixedCost', '-')
          setValue('ProfitFixedTotalCost', dataObj.IsProfitFixedApplicable ? checkForDecimalAndNull(dataObj.ProfitFixedPercentage, initialConfiguration.NoOfDecimalForPrice) : '')
          setProfitObj({
            ...profitObj,
            ProfitFixedPercentage: dataObj?.ProfitFixedPercentage,
            ProfitFixedCost: '-',
            ProfitFixedTotalCost: dataObj?.ProfitFixedPercentage
          })

        }

        if (dataObj.IsProfitCombined && IsAPIResponse === false) {
          setValue('ProfitPercentage', dataObj.IsProfitCombined ? dataObj.ProfitPercentage : '')
          setValue('ProfitCombinedCost', checkForDecimalAndNull(headerCosts && CutOffRMBOPCCTotal, initialConfiguration.NoOfDecimalForPrice))        //setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * calculatePercentage(dataObj.ProfitPercentage), initialConfiguration.NoOfDecimalForPrice))

        }

        // COMBINED(TRIPLE)
        if (dataObj.IsProfitRMApplicable && dataObj.IsProfitBOPApplicable && dataObj.IsProfitCCApplicable) {
          //RM
          const profitRMCost = headerCosts && IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost
          const profitTotalCostRM = profitRMCost * calculatePercentage(dataObj.ProfitRMPercentage)
          setValue('ProfitRMPercentage', dataObj.IsProfitRMApplicable ? dataObj.ProfitRMPercentage : '')
          setValue('ProfitRMCost', checkForDecimalAndNull(profitRMCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('ProfitRMTotalCost', checkForDecimalAndNull(profitTotalCostRM, initialConfiguration.NoOfDecimalForPrice))
          //BOP
          const profitBOPCost = headerCosts.NetBoughtOutPartCost
          const profitTotalCostBOP = profitBOPCost * calculatePercentage(dataObj.ProfitBOPPercentage)
          setValue('ProfitBOPPercentage', dataObj.IsProfitBOPApplicable ? dataObj.ProfitBOPPercentage : '')
          setValue('ProfitBOPCost', headerCosts && checkForDecimalAndNull(profitBOPCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('ProfitBOPTotalCost', checkForDecimalAndNull(profitTotalCostBOP, initialConfiguration.NoOfDecimalForPrice))
          //CC
          const profitCCCost = headerCosts && (headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal)
          const profitTotalCostCC = profitCCCost * calculatePercentage(dataObj.ProfitCCPercentage)
          setValue('ProfitCCPercentage', dataObj.IsProfitCCApplicable ? dataObj.ProfitCCPercentage : '')
          setValue('ProfitCCCost', checkForDecimalAndNull(profitCCCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('ProfitCCTotalCost', checkForDecimalAndNull(profitTotalCostCC, initialConfiguration.NoOfDecimalForPrice))
          setTempProfitObj({
            ...tempProfitObj,
            ProfitRMPercentage: dataObj.ProfitRMPercentage,
            ProfitRMCost: checkForNull(profitRMCost),
            ProfitRMTotalCost: profitTotalCostRM,
            ProfitBOPPercentage: dataObj.ProfitBOPPercentage,
            ProfitBOPCost: checkForNull(profitBOPCost),
            ProfitBOPTotalCost: profitTotalCostBOP,
            ProfitCCPercentage: dataObj.ProfitCCPercentage,
            ProfitCCCost: profitCCCost,
            ProfitCCTotalCost: profitTotalCostCC
          })
        }

        // SINGLE
        if (dataObj.IsProfitRMApplicable && !dataObj.IsProfitBOPApplicable && !dataObj.IsProfitCCApplicable) {
          const profitRMCost = headerCosts && IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost
          profitTotalCost = profitRMCost * calculatePercentage(dataObj.ProfitRMPercentage)
          setValue('ProfitRMPercentage', dataObj.IsProfitRMApplicable ? dataObj.ProfitRMPercentage : '')
          setValue('ProfitRMCost', checkForDecimalAndNull(profitRMCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('ProfitRMTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration.NoOfDecimalForPrice))
          setTempProfitObj({
            ...tempProfitObj,
            ProfitRMPercentage: dataObj.ProfitRMPercentage,
            ProfitRMCost: checkForNull(profitRMCost),
            ProfitRMTotalCost: profitTotalCost
          })
        }

        if (dataObj.IsProfitBOPApplicable && !dataObj.IsProfitRMApplicable && !dataObj.IsProfitCCApplicable) {
          const profitBOPCost = headerCosts.NetBoughtOutPartCost
          profitTotalCost = profitBOPCost * calculatePercentage(dataObj.ProfitBOPPercentage)
          setValue('ProfitBOPPercentage', dataObj.IsProfitBOPApplicable ? dataObj.ProfitBOPPercentage : '')
          setValue('ProfitBOPCost', headerCosts && checkForDecimalAndNull(profitBOPCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('ProfitBOPTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration.NoOfDecimalForPrice))
          setTempProfitObj({
            ...tempProfitObj,
            ProfitBOPPercentage: dataObj.ProfitBOPPercentage,
            ProfitBOPCost: checkForNull(profitBOPCost),
            ProfitBOPTotalCost: profitTotalCost
          })
        }

        if (dataObj.IsProfitCCApplicable && !dataObj.IsProfitRMApplicable && !dataObj.IsProfitBOPApplicable) {
          const profitCCCost = headerCosts && (headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal)
          profitTotalCost = profitCCCost * calculatePercentage(dataObj.ProfitCCPercentage)
          setValue('ProfitCCPercentage', dataObj.IsProfitCCApplicable ? dataObj.ProfitCCPercentage : '')
          setValue('ProfitCCCost', checkForDecimalAndNull(profitCCCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('ProfitCCTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration.NoOfDecimalForPrice))
          setTempProfitObj({
            ...tempProfitObj,
            ProfitCCPercentage: dataObj.ProfitCCPercentage,
            ProfitCCCost: profitCCCost,
            ProfitCCTotalCost: profitTotalCost
          })
        }
        //COMBINED(DOUBLE)
        if (dataObj.IsProfitRMApplicable && dataObj.IsProfitCCApplicable && !dataObj.IsProfitBOPApplicable) {
          const profitRMCost = headerCosts && IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost
          const profitTotalRMCost = profitRMCost * calculatePercentage(dataObj.ProfitRMPercentage)
          setValue('ProfitRMPercentage', dataObj.IsProfitRMApplicable ? dataObj.ProfitRMPercentage : '')
          setValue('ProfitRMCost', checkForDecimalAndNull(profitRMCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('ProfitRMTotalCost', checkForDecimalAndNull(profitTotalRMCost, initialConfiguration.NoOfDecimalForPrice))
          const profitCCCost = headerCosts && (headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal)
          const profitTotalCCCost = profitCCCost * calculatePercentage(dataObj.ProfitCCPercentage)
          setValue('ProfitCCPercentage', dataObj.IsProfitCCApplicable ? dataObj.ProfitCCPercentage : '')
          setValue('ProfitCCCost', checkForDecimalAndNull(profitCCCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('ProfitCCTotalCost', checkForDecimalAndNull(profitTotalCCCost, initialConfiguration.NoOfDecimalForPrice))
          setTempProfitObj({
            ...tempProfitObj,
            ProfitCCPercentage: dataObj.ProfitCCPercentage,
            ProfitCCCost: profitCCCost,
            ProfitCCTotalCost: profitTotalCCCost,
            ProfitRMPercentage: dataObj.ProfitRMPercentage,
            ProfitRMCost: checkForNull(profitRMCost),
            ProfitRMTotalCost: profitTotalRMCost
          })
        }

        if (dataObj.IsProfitRMApplicable && dataObj.IsProfitBOPApplicable && !dataObj.IsProfitCCApplicable) {
          const profitRMCost = headerCosts && IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost
          const profitTotalRMCost = profitRMCost * calculatePercentage(dataObj.ProfitRMPercentage)
          setValue('ProfitRMPercentage', dataObj.IsProfitRMApplicable ? dataObj.ProfitRMPercentage : '')
          setValue('ProfitRMCost', checkForDecimalAndNull(profitRMCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('ProfitRMTotalCost', checkForDecimalAndNull(profitTotalRMCost, initialConfiguration.NoOfDecimalForPrice))
          const profitBOPCost = headerCosts.NetBoughtOutPartCost
          const profitTotalBOPCost = profitBOPCost * calculatePercentage(dataObj.ProfitBOPPercentage)
          setValue('ProfitBOPPercentage', dataObj.IsProfitBOPApplicable ? dataObj.ProfitBOPPercentage : '')
          setValue('ProfitBOPCost', headerCosts && checkForDecimalAndNull(profitBOPCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('ProfitBOPTotalCost', checkForDecimalAndNull(profitTotalBOPCost, initialConfiguration.NoOfDecimalForPrice))
          setTempProfitObj({
            ...tempProfitObj,
            ProfitBOPPercentage: dataObj.ProfitBOPPercentage,
            ProfitBOPCost: checkForNull(profitBOPCost),
            ProfitBOPTotalCost: profitTotalBOPCost,
            ProfitRMPercentage: dataObj.ProfitRMPercentage,
            ProfitRMCost: checkForNull(profitRMCost),
            ProfitRMTotalCost: profitTotalRMCost
          })
        }
        if (dataObj.IsProfitBOPApplicable && dataObj.IsProfitCCApplicable && !dataObj.IsProfitRMApplicable) {
          const profitBOPCost = headerCosts.NetBoughtOutPartCost
          const profitTotalBOPCost = profitBOPCost * calculatePercentage(dataObj.ProfitBOPPercentage)
          setValue('ProfitBOPPercentage', dataObj.IsProfitBOPApplicable ? dataObj.ProfitBOPPercentage : '')
          setValue('ProfitBOPCost', headerCosts && checkForDecimalAndNull(profitBOPCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('ProfitBOPTotalCost', checkForDecimalAndNull(profitTotalBOPCost, initialConfiguration.NoOfDecimalForPrice))
          const profitCCCost = headerCosts && (headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal)
          const profitTotalCCCost = profitCCCost * calculatePercentage(dataObj.ProfitCCPercentage)
          setValue('ProfitCCPercentage', dataObj.IsProfitCCApplicable ? dataObj.ProfitCCPercentage : '')
          setValue('ProfitCCCost', checkForDecimalAndNull(profitCCCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('ProfitCCTotalCost', checkForDecimalAndNull(profitTotalCCCost, initialConfiguration.NoOfDecimalForPrice))
          setTempProfitObj({
            ...tempProfitObj,
            ProfitBOPPercentage: dataObj.ProfitBOPPercentage,
            ProfitBOPCost: checkForNull(profitBOPCost),
            ProfitBOPTotalCost: profitTotalBOPCost,
            ProfitCCPercentage: dataObj.ProfitCCPercentage,
            ProfitCCCost: profitCCCost,
            ProfitCCTotalCost: profitTotalCCCost,
          })
        }
      }
    }
  }

  /**
  * @method IncludeSurfaceTreatmentCall
  * @description INCLUDE SURFACE TREATMENT IN TO OVERHEAD AND PROFIT
  */

  const IncludeSurfaceTreatmentCall = () => {
    if (partType) {

      if (!CostingViewMode) {

        const NetSurfaceTreatmentCost = subAssemblyTechnologyTabData && subAssemblyTechnologyTabData[0]?.CostingPartDetails?.NetSurfaceTreatmentCost;                                                           //LATER headerCosts.ProcessCostTotal
        const assemblyLevelOperations = checkForNull(subAssemblyTechnologyTabData && subAssemblyTechnologyTabData[0]?.processCostValue) + checkForNull(subAssemblyTechnologyTabData && subAssemblyTechnologyTabData[0]?.operationCostValue)                                                           //LATER headerCosts.ProcessCostTotal
        const BOPTotalCost = subAssemblyTechnologyTabData && subAssemblyTechnologyTabData[0]?.CostingPartDetails?.CostPerAssemblyBOP                                                           //LATER headerCosts.ProcessCostTotal
        const EditPartCost = subAssemblyTechnologyTabData && subAssemblyTechnologyTabData[0]?.CostingPartDetails?.EditPartCost                                                           //LATER headerCosts.ProcessCostTotal

        let CCCost = assemblyLevelOperations
        let RM_CC_BOP = checkForNull(EditPartCost) + checkForNull(assemblyLevelOperations) + checkForNull(BOPTotalCost)
        let RM_CC = checkForNull(EditPartCost) + checkForNull(assemblyLevelOperations)
        let BOP_CC = checkForNull(assemblyLevelOperations) + checkForNull(BOPTotalCost)
        let RM_BOP = checkForNull(EditPartCost) + checkForNull(BOPTotalCost)

        let OverheadCCPercentage = overheadObj?.OverheadCCPercentage ? overheadObj?.OverheadCCPercentage : ''
        let ProfiCCPercentage = profitObj?.ProfitCCPercentage ? profitObj?.ProfitCCPercentage : ''


        // START HERE ADD CC IN OVERHEAD                     //DONE
        if (IsIncludedSurfaceInOverheadProfit && IsSurfaceTreatmentAdded === false && overheadObj && overheadObj.IsOverheadCCApplicable) {
          const OverheadCCCost = checkForNull(CCCost) + checkForNull(NetSurfaceTreatmentCost)
          const OverheadCCTotalCost = checkForNull(OverheadCCCost) * calculatePercentage(OverheadCCPercentage)

          setValue('OverheadCCCost', checkForDecimalAndNull(OverheadCCCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('OverheadCCTotalCost', checkForDecimalAndNull(OverheadCCTotalCost, initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(true)
          setOverheadObj({
            ...overheadObj,
            OverheadCCCost: checkForNull(OverheadCCCost),
            OverheadCCTotalCost: OverheadCCTotalCost
          })
          setTempOverheadObj({
            ...tempOverheadObj,
            OverheadCCPercentage: OverheadCCPercentage,
            OverheadCCCost: checkForNull(OverheadCCCost),
            OverheadCCTotalCost: OverheadCCTotalCost
          })

        } else if (!IsIncludedSurfaceInOverheadProfit && overheadObj && overheadObj.IsOverheadCCApplicable) {

          const OverheadCCCost = checkForNull(CCCost)
          const OverheadCCPercentage = overheadObj.IsOverheadCCApplicable ? overheadObj.OverheadCCPercentage : ''
          const OverheadCCTotalCost = checkForNull(OverheadCCCost) * calculatePercentage(OverheadCCPercentage)

          setValue('OverheadCCCost', checkForDecimalAndNull(OverheadCCCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('OverheadCCTotalCost', checkForDecimalAndNull(OverheadCCTotalCost, initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(false)
          setOverheadObj({
            ...overheadObj,
            OverheadCCCost: checkForNull(OverheadCCCost),
            OverheadCCTotalCost: OverheadCCTotalCost
          })
          setTempOverheadObj({
            ...tempOverheadObj,
            OverheadCCPercentage: OverheadCCPercentage,
            OverheadCCCost: checkForNull(OverheadCCCost),
            OverheadCCTotalCost: OverheadCCTotalCost
          })

          // END HERE ADD CC IN OVERHEAD
        }

        // START ADD CC IN PROFIT                            //DONE
        if (IsIncludedSurfaceInOverheadProfit && IsSurfaceTreatmentAdded === false && profitObj && profitObj.IsProfitCCApplicable) {

          const profitCCCost = checkForNull(CCCost) + checkForNull(NetSurfaceTreatmentCost)
          const profitTotalCost = checkForNull(profitCCCost) * calculatePercentage(checkForNull(ProfiCCPercentage))

          setValue('ProfitCCCost', checkForDecimalAndNull(profitCCCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('ProfitCCTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(true)

          setProfitObj({
            ...profitObj,
            ProfitCCCost: profitCCCost,
            ProfitCCTotalCost: profitTotalCost
          })

          setTempProfitObj({
            ...tempProfitObj,
            ProfitCCPercentage: ProfiCCPercentage,
            ProfitCCCost: profitCCCost,
            ProfitCCTotalCost: profitTotalCost
          })

        } else if (!IsIncludedSurfaceInOverheadProfit && profitObj && profitObj.IsProfitCCApplicable) {

          const profitCCCost = checkForNull(CCCost)
          const profitTotalCost = profitCCCost * calculatePercentage(ProfiCCPercentage)
          setValue('ProfitCCCost', checkForDecimalAndNull(profitCCCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('ProfitCCTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(false)
          setProfitObj({
            ...profitObj,
            ProfitCCCost: profitCCCost,
            ProfitCCTotalCost: profitTotalCost,
          })
          setTempProfitObj({
            ...tempProfitObj,
            ProfitCCPercentage: ProfiCCPercentage,
            ProfitCCCost: profitCCCost,
            ProfitCCTotalCost: profitTotalCost
          })
          // END HERE ADD CC IN PROFIT
        }

        // START ADD CC IN OVERHEAD COMBINED                 //DONE  
        if (IsIncludedSurfaceInOverheadProfit && IsSurfaceTreatmentAdded === false && overheadObj && overheadObj.IsOverheadCombined) {
          const { OverheadApplicability, OverheadPercentage } = overheadObj;

          let overheadTotalCost = 0
          let overheadCombinedCost = 0
          switch (OverheadApplicability) {
            case 'RM + CC + BOP':

              overheadCombinedCost = checkForNull(RM_CC_BOP) + checkForNull(NetSurfaceTreatmentCost)
              overheadTotalCost = overheadCombinedCost * calculatePercentage(OverheadPercentage)

              setValue('OverheadPercentage', OverheadPercentage)
              setValue('OverheadCombinedCost', checkForDecimalAndNull(overheadCombinedCost, initialConfiguration.NoOfDecimalForPrice))
              setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(overheadTotalCost, initialConfiguration.NoOfDecimalForPrice))

              setIsSurfaceTreatmentAdded(true)
              setOverheadObj({
                ...overheadObj,
                OverheadCombinedCost: checkForNull(overheadCombinedCost),
                OverheadCombinedTotalCost: overheadTotalCost,
              })
              break;

            case 'RM + CC':

              overheadCombinedCost = checkForNull(RM_CC) + checkForNull(NetSurfaceTreatmentCost)
              overheadTotalCost = checkForNull(overheadCombinedCost) * calculatePercentage(checkForNull(OverheadPercentage))
              setValue('OverheadPercentage', OverheadPercentage)
              setValue('OverheadCombinedCost', checkForDecimalAndNull(overheadCombinedCost, initialConfiguration.NoOfDecimalForPrice))
              setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(overheadTotalCost, initialConfiguration.NoOfDecimalForPrice))
              setOverheadObj({
                ...overheadObj,
                OverheadCombinedCost: overheadCombinedCost,
                OverheadCombinedTotalCost: overheadTotalCost,
              })
              break;

            case 'BOP + CC':

              overheadCombinedCost = checkForNull(BOP_CC) + checkForNull(NetSurfaceTreatmentCost)
              overheadTotalCost = checkForNull(overheadCombinedCost) * calculatePercentage(checkForNull(OverheadPercentage))

              setValue('OverheadPercentage', OverheadPercentage)
              setValue('OverheadCombinedCost', checkForDecimalAndNull(overheadCombinedCost, initialConfiguration.NoOfDecimalForPrice))
              setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(overheadTotalCost, initialConfiguration.NoOfDecimalForPrice))
              setOverheadObj({
                ...overheadObj,
                OverheadCombinedCost: overheadCombinedCost,
                OverheadCombinedTotalCost: overheadTotalCost,
              })
              break;

            case 'RM + BOP':

              overheadCombinedCost = checkForNull(RM_BOP)
              overheadTotalCost = checkForNull(overheadCombinedCost) * calculatePercentage(checkForNull(OverheadPercentage))
              setValue('OverheadPercentage', OverheadPercentage)
              setValue('OverheadCombinedCost', checkForDecimalAndNull(overheadCombinedCost, initialConfiguration.NoOfDecimalForPrice))
              setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(overheadTotalCost, initialConfiguration.NoOfDecimalForPrice))
              setOverheadObj({
                ...overheadObj,
                OverheadCombinedCost: overheadCombinedCost,
                OverheadCombinedTotalCost: overheadTotalCost,
              })
              break;

            default:
              break;
          }

        } else if (!IsIncludedSurfaceInOverheadProfit && overheadObj && overheadObj.IsOverheadCombined) {
          const { OverheadApplicability, OverheadPercentage } = overheadObj;
          let overheadTotalCost = 0
          let overheadCombinedCost = 0

          switch (OverheadApplicability) {
            case 'RM + CC + BOP':

              overheadCombinedCost = checkForNull(RM_CC_BOP)
              overheadTotalCost = overheadCombinedCost * calculatePercentage(OverheadPercentage)
              setValue('OverheadPercentage', OverheadPercentage)
              setValue('OverheadCombinedCost', checkForDecimalAndNull(overheadCombinedCost, initialConfiguration.NoOfDecimalForPrice))
              setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(overheadTotalCost, initialConfiguration.NoOfDecimalForPrice))
              setIsSurfaceTreatmentAdded(false)
              setOverheadObj({
                ...overheadObj,
                OverheadCombinedCost: overheadCombinedCost,
                OverheadCombinedTotalCost: overheadTotalCost
              })
              break;

            case 'RM + CC':

              overheadCombinedCost = checkForNull(RM_CC)
              overheadTotalCost = checkForNull(overheadCombinedCost) * calculatePercentage(checkForNull(OverheadPercentage))

              setValue('OverheadPercentage', OverheadPercentage)
              setValue('OverheadCombinedCost', checkForDecimalAndNull(overheadCombinedCost, initialConfiguration.NoOfDecimalForPrice))
              setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(overheadTotalCost, initialConfiguration.NoOfDecimalForPrice))
              setIsSurfaceTreatmentAdded(false)
              setOverheadObj({
                ...overheadObj,
                OverheadCombinedCost: overheadCombinedCost,
                OverheadCombinedTotalCost: overheadTotalCost,
              })
              break;

            case 'BOP + CC':
              overheadCombinedCost = checkForNull(BOP_CC)
              overheadTotalCost = checkForNull(overheadCombinedCost) * calculatePercentage(checkForNull(OverheadPercentage))
              setValue('OverheadPercentage', OverheadPercentage)
              setValue('OverheadCombinedCost', checkForDecimalAndNull(overheadCombinedCost, initialConfiguration.NoOfDecimalForPrice))
              setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(overheadTotalCost, initialConfiguration.NoOfDecimalForPrice))
              setIsSurfaceTreatmentAdded(false)
              setOverheadObj({
                ...overheadObj,
                OverheadCombinedCost: overheadCombinedCost,
                OverheadCombinedTotalCost: overheadTotalCost,
              })
              break;

            case 'RM + BOP':

              overheadCombinedCost = checkForNull(RM_BOP)
              overheadTotalCost = checkForNull(overheadCombinedCost) * calculatePercentage(checkForNull(OverheadPercentage))
              setValue('OverheadPercentage', OverheadPercentage)
              setValue('OverheadCombinedCost', checkForDecimalAndNull(overheadCombinedCost, initialConfiguration.NoOfDecimalForPrice))
              setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(overheadTotalCost, initialConfiguration.NoOfDecimalForPrice))
              setOverheadObj({
                ...overheadObj,
                OverheadCombinedCost: overheadCombinedCost,
                OverheadCombinedTotalCost: overheadTotalCost,
              })
              break;

            default:
              break;
          }
          // END HERE ADD CC IN OVERHEAD COMBINED
        }

        // START ADD CC IN PROFIT COMBINED                   //DONE
        if (IsIncludedSurfaceInOverheadProfit && IsSurfaceTreatmentAdded === false && profitObj && profitObj.IsProfitCombined) {
          const { ProfitApplicability, ProfitPercentage } = profitObj;
          let profitCombinedCost = 0
          let profitTotalCost = 0
          switch (ProfitApplicability) {

            case 'RM + CC + BOP':

              profitCombinedCost = checkForNull(RM_CC_BOP) + checkForNull(NetSurfaceTreatmentCost)
              profitTotalCost = checkForNull(profitCombinedCost) * calculatePercentage(checkForNull(ProfitPercentage))

              setValue('ProfitPercentage', ProfitPercentage)
              setValue('ProfitCombinedCost', checkForDecimalAndNull(profitCombinedCost, initialConfiguration.NoOfDecimalForPrice))
              setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration.NoOfDecimalForPrice))

              setIsSurfaceTreatmentAdded(true)
              setProfitObj({
                ...profitObj,
                ProfitCombinedCost: profitCombinedCost,
                ProfitCombinedTotalCost: profitTotalCost,
              })
              break;

            case 'RM + CC':

              profitCombinedCost = checkForNull(RM_CC) + checkForNull(NetSurfaceTreatmentCost)
              profitTotalCost = profitCombinedCost * calculatePercentage(ProfitPercentage)
              setValue('ProfitPercentage', ProfitPercentage)
              setValue('ProfitCombinedCost', checkForDecimalAndNull(profitCombinedCost, initialConfiguration.NoOfDecimalForPrice))
              setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration.NoOfDecimalForPrice))
              setIsSurfaceTreatmentAdded(true)
              setProfitObj({
                ...profitObj,
                ProfitCombinedCost: profitCombinedCost,
                ProfitCombinedTotalCost: profitTotalCost
              })
              break;

            case 'BOP + CC':

              profitCombinedCost = checkForNull(BOP_CC) + checkForNull(NetSurfaceTreatmentCost)
              profitTotalCost = profitCombinedCost * calculatePercentage(ProfitPercentage)
              setValue('ProfitPercentage', ProfitPercentage)
              setValue('ProfitCombinedCost', checkForDecimalAndNull(profitCombinedCost, initialConfiguration.NoOfDecimalForPrice))
              setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration.NoOfDecimalForPrice))
              setIsSurfaceTreatmentAdded(true)
              setProfitObj({
                ...profitObj,
                ProfitCombinedCost: profitCombinedCost,
                ProfitCombinedTotalCost: profitTotalCost,
              })
              break;

            case 'RM + BOP':

              profitCombinedCost = checkForNull(RM_BOP)
              profitTotalCost = checkForNull(profitCombinedCost) * calculatePercentage(checkForNull(ProfitPercentage))
              setValue('ProfitPercentage', ProfitPercentage)
              setValue('ProfitCombinedCost', checkForDecimalAndNull(profitCombinedCost, initialConfiguration.NoOfDecimalForPrice))
              setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration.NoOfDecimalForPrice))
              setProfitObj({
                ...profitObj,
                ProfitPercentage: ProfitPercentage,
                ProfitCombinedCost: profitCombinedCost,
                ProfitCombinedTotalCost: profitTotalCost,
              })
              break;

            default:
              break;
          }

        } else if (!IsIncludedSurfaceInOverheadProfit && profitObj && profitObj.IsProfitCombined) {
          const { ProfitApplicability, ProfitPercentage } = profitObj;
          let profitCombinedCost = 0
          let profitTotalCost = 0
          switch (ProfitApplicability) {
            case 'RM + CC + BOP':

              profitCombinedCost = checkForNull(RM_CC_BOP)
              profitTotalCost = checkForNull(profitCombinedCost) * calculatePercentage(checkForNull(ProfitPercentage))
              setValue('ProfitPercentage', ProfitPercentage)
              setValue('ProfitCombinedCost', checkForDecimalAndNull(profitCombinedCost, initialConfiguration.NoOfDecimalForPrice))
              setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration.NoOfDecimalForPrice))
              setIsSurfaceTreatmentAdded(false)
              setProfitObj({
                ...profitObj,
                ProfitPercentage: ProfitPercentage,
                ProfitCombinedCost: profitCombinedCost,
                ProfitCombinedTotalCost: profitTotalCost,
              })
              break;

            case 'RM + CC':

              profitCombinedCost = checkForNull(RM_CC)
              profitTotalCost = checkForNull(profitCombinedCost) * calculatePercentage(checkForNull(ProfitPercentage))
              setValue('ProfitPercentage', ProfitPercentage)
              setValue('ProfitCombinedCost', checkForDecimalAndNull(profitCombinedCost, initialConfiguration.NoOfDecimalForPrice))
              setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration.NoOfDecimalForPrice))
              setIsSurfaceTreatmentAdded(false)
              setProfitObj({
                ...profitObj,
                ProfitPercentage: ProfitPercentage,
                ProfitCombinedCost: profitCombinedCost,
                ProfitCombinedTotalCost: profitTotalCost
              })
              break;

            case 'BOP + CC':

              profitCombinedCost = checkForNull(BOP_CC)
              profitTotalCost = checkForNull(profitCombinedCost) * calculatePercentage(checkForNull(ProfitPercentage))
              setValue('ProfitPercentage', ProfitPercentage)
              setValue('ProfitCombinedCost', checkForDecimalAndNull(profitCombinedCost, initialConfiguration.NoOfDecimalForPrice))
              setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration.NoOfDecimalForPrice))
              setIsSurfaceTreatmentAdded(false)
              setProfitObj({
                ...profitObj,
                ProfitPercentage: ProfitPercentage,
                ProfitCombinedCost: profitCombinedCost,
                ProfitCombinedTotalCost: profitTotalCost,
              })
              break;

            case 'RM + BOP':

              profitCombinedCost = checkForNull(RM_BOP)
              profitTotalCost = profitCombinedCost * calculatePercentage(ProfitPercentage)
              setValue('ProfitPercentage', ProfitPercentage)
              setValue('ProfitCombinedCost', checkForDecimalAndNull(profitCombinedCost, initialConfiguration.NoOfDecimalForPrice))
              setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration.NoOfDecimalForPrice))
              setProfitObj({
                ...profitObj,
                ProfitPercentage: ProfitPercentage,
                ProfitCombinedCost: profitCombinedCost,
                ProfitCombinedTotalCost: profitTotalCost,
              })
              break;

            default:
              break;
          }
          // END HERE ADD CC IN PROFIT COMBINED
        }
        dispatch(isOverheadProfitDataChange(true))
      }

      // subAssemblyOverheadCalc(CostingOverheadDetail)
      // subAssemblyProfitCalc(CostingOverheadDetail)
    } else {
      if (!CostingViewMode) {
        const { IsCutOffApplicable, CutOffRMC } = RMCCutOffObj;
        const ConversionCostForCalculation = costData.IsAssemblyPart ? checkForNull(headerCosts.NetConversionCost) - checkForNull(headerCosts.TotalOtherOperationCostPerAssembly) : headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal
        const RMBOPCC = headerCosts.NetRawMaterialsCost + headerCosts.NetBoughtOutPartCost + ConversionCostForCalculation
        const CutOffRMBOPCCTotal = IsCutOffApplicable && headerCosts ? CutOffRMC + headerCosts.NetBoughtOutPartCost + ConversionCostForCalculation : RMBOPCC;
        const NetSurfaceTreatmentCost = SurfaceTreatmentCost && SurfaceTreatmentCost.NetSurfaceTreatmentCost !== undefined ? checkForNull(SurfaceTreatmentCost?.NetSurfaceTreatmentCost) : checkForNull(CostingDataList[0]?.NetSurfaceTreatmentCost);
        const NetConversionCost = ConversionCostForCalculation
        // START HERE ADD CC IN OVERHEAD
        if (IsIncludedSurfaceInOverheadProfit && IsSurfaceTreatmentAdded === false && overheadObj && overheadObj.IsOverheadCCApplicable) {

          const { OverheadCCPercentage } = overheadObj;
          const overheadCCCost = checkForNull(NetConversionCost) + checkForNull(NetSurfaceTreatmentCost)
          setValue('OverheadCCCost', checkForDecimalAndNull(overheadCCCost, initialConfiguration.NoOfDecimalForPrice))
          const totalOverheadCost = (checkForNull(NetConversionCost) + checkForNull(NetSurfaceTreatmentCost)) * calculatePercentage(OverheadCCPercentage)
          setValue('OverheadCCTotalCost', checkForDecimalAndNull(totalOverheadCost, initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(true)
          setOverheadObj({
            ...overheadObj,
            OverheadCCCost: overheadCCCost,
            OverheadCCTotalCost: totalOverheadCost,
          })
          setTempOverheadObj({
            ...tempOverheadObj,
            OverheadCCPercentage: OverheadCCPercentage,
            OverheadCCCost: overheadCCCost,
            OverheadCCTotalCost: totalOverheadCost
          })

        } else if (!IsIncludedSurfaceInOverheadProfit && overheadObj && overheadObj.IsOverheadCCApplicable) {

          const { OverheadCCPercentage } = overheadObj;
          setValue('OverheadCCCost', headerCosts !== undefined ? checkForDecimalAndNull(NetConversionCost, initialConfiguration.NoOfDecimalForPrice) : 0)
          const totalOverheadCost = checkForNull(NetConversionCost) * calculatePercentage(OverheadCCPercentage)
          setValue('OverheadCCTotalCost', checkForDecimalAndNull(totalOverheadCost, initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(false)
          setOverheadObj({
            ...overheadObj,
            OverheadCCCost: checkForNull(NetConversionCost),
            OverheadCCTotalCost: totalOverheadCost
          })
          setTempOverheadObj({
            ...tempOverheadObj,
            OverheadCCPercentage: OverheadCCPercentage,
            OverheadCCCost: checkForNull(NetConversionCost),
            OverheadCCTotalCost: totalOverheadCost
          })

          // END HERE ADD CC IN OVERHEAD
        }

        // START ADD CC IN PROFIT
        if (IsIncludedSurfaceInOverheadProfit && IsSurfaceTreatmentAdded === false && profitObj && profitObj.IsProfitCCApplicable) {

          const { ProfitCCPercentage } = profitObj;
          const profitCCCost = checkForNull(NetConversionCost) + checkForNull(NetSurfaceTreatmentCost)
          const profitTotalCost = profitCCCost * calculatePercentage(ProfitCCPercentage)
          setValue('ProfitCCCost', checkForDecimalAndNull(profitCCCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('ProfitCCTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(true)
          setProfitObj({
            ...profitObj,
            ProfitCCCost: profitCCCost,
            ProfitCCTotalCost: profitTotalCost
          })
          setTempProfitObj({
            ...tempProfitObj,
            ProfitCCPercentage: ProfitCCPercentage,
            ProfitCCCost: profitCCCost,
            ProfitCCTotalCost: profitTotalCost
          })
        } else if (!IsIncludedSurfaceInOverheadProfit && profitObj && profitObj.IsProfitCCApplicable) {

          const { ProfitCCPercentage } = profitObj;
          const profitCCCost = checkForNull(NetConversionCost)
          const profitTotalCost = profitCCCost * calculatePercentage(ProfitCCPercentage)
          setValue('ProfitCCCost', checkForDecimalAndNull(profitCCCost, initialConfiguration.NoOfDecimalForPrice))
          setValue('ProfitCCTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration.NoOfDecimalForPrice))
          setIsSurfaceTreatmentAdded(false)
          setProfitObj({
            ...profitObj,
            ProfitCCCost: profitCCCost,
            ProfitCCTotalCost: profitTotalCost,
          })
          setTempProfitObj({
            ...tempProfitObj,
            ProfitCCPercentage: ProfitCCPercentage,
            ProfitCCCost: profitCCCost,
            ProfitCCTotalCost: profitTotalCost
          })
          // END HERE ADD CC IN PROFIT
        }

        // START ADD CC IN OVERHEAD COMBINED
        if (IsIncludedSurfaceInOverheadProfit && IsSurfaceTreatmentAdded === false && overheadObj && overheadObj.IsOverheadCombined) {
          const { OverheadApplicability, OverheadPercentage } = overheadObj;

          let overheadTotalCost = 0
          let overheadCombinedCost = 0
          switch (OverheadApplicability) {
            case 'RM + CC + BOP':

              setValue('OverheadPercentage', OverheadPercentage)
              overheadCombinedCost = CutOffRMBOPCCTotal + NetSurfaceTreatmentCost
              overheadTotalCost = overheadCombinedCost * calculatePercentage(OverheadPercentage)
              setValue('OverheadCombinedCost', checkForDecimalAndNull(overheadCombinedCost, initialConfiguration.NoOfDecimalForPrice))
              setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(overheadTotalCost, initialConfiguration.NoOfDecimalForPrice))
              setIsSurfaceTreatmentAdded(true)
              setOverheadObj({
                ...overheadObj,
                OverheadCombinedCost: checkForNull(overheadCombinedCost),
                OverheadCombinedTotalCost: overheadTotalCost,
              })
              break;

            case 'RM + CC':

              const RMCC = (IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost) + NetConversionCost;
              overheadCombinedCost = RMCC + NetSurfaceTreatmentCost
              overheadTotalCost = overheadCombinedCost * calculatePercentage(OverheadPercentage)
              setValue('OverheadPercentage', OverheadPercentage)
              setValue('OverheadCombinedCost', checkForDecimalAndNull(overheadCombinedCost, initialConfiguration.NoOfDecimalForPrice))
              setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(overheadTotalCost, initialConfiguration.NoOfDecimalForPrice))
              setOverheadObj({
                ...overheadObj,
                OverheadCombinedCost: overheadCombinedCost,
                OverheadCombinedTotalCost: overheadTotalCost,
              })
              break;

            case 'BOP + CC':
              const BOPCC = headerCosts.NetBoughtOutPartCost + NetConversionCost;
              overheadCombinedCost = BOPCC + NetSurfaceTreatmentCost
              overheadTotalCost = overheadCombinedCost * calculatePercentage(OverheadPercentage)
              setValue('OverheadPercentage', OverheadPercentage)
              setValue('OverheadCombinedCost', checkForDecimalAndNull(overheadCombinedCost, initialConfiguration.NoOfDecimalForPrice))
              setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(overheadTotalCost, initialConfiguration.NoOfDecimalForPrice))
              setOverheadObj({
                ...overheadObj,
                OverheadCombinedCost: overheadCombinedCost,
                OverheadCombinedTotalCost: overheadTotalCost,
              })
              break;
            case 'RM + BOP':
              const RMBOP = (IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost) + headerCosts.NetBoughtOutPartCost;
              overheadCombinedCost = RMBOP
              overheadTotalCost = overheadCombinedCost * calculatePercentage(OverheadPercentage)
              setValue('OverheadPercentage', OverheadPercentage)
              setValue('OverheadCombinedCost', checkForDecimalAndNull(overheadCombinedCost, initialConfiguration.NoOfDecimalForPrice))
              setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(overheadTotalCost, initialConfiguration.NoOfDecimalForPrice))
              setOverheadObj({
                ...overheadObj,
                OverheadCombinedCost: overheadCombinedCost,
                OverheadCombinedTotalCost: overheadTotalCost,
              })
              break;

            default:
              break;
          }

        } else if (!IsIncludedSurfaceInOverheadProfit && overheadObj && overheadObj.IsOverheadCombined) {
          const { OverheadApplicability, OverheadPercentage } = overheadObj;
          let overheadTotalCost = 0
          let overheadCombinedCost = 0
          switch (OverheadApplicability) {
            case 'RM + CC + BOP':
              overheadCombinedCost = CutOffRMBOPCCTotal
              overheadTotalCost = overheadCombinedCost * calculatePercentage(OverheadPercentage)
              setValue('OverheadPercentage', OverheadPercentage)
              setValue('OverheadCombinedCost', checkForDecimalAndNull(overheadCombinedCost, initialConfiguration.NoOfDecimalForPrice))
              setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(overheadTotalCost, initialConfiguration.NoOfDecimalForPrice))
              setIsSurfaceTreatmentAdded(false)
              setOverheadObj({
                ...overheadObj,
                OverheadCombinedCost: overheadCombinedCost,
                OverheadCombinedTotalCost: overheadTotalCost
              })
              break;

            case 'RM + CC':
              const RMCC = (IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost) + NetConversionCost;
              overheadCombinedCost = RMCC
              overheadTotalCost = overheadCombinedCost * calculatePercentage(OverheadPercentage)

              setValue('OverheadPercentage', OverheadPercentage)
              setValue('OverheadCombinedCost', checkForDecimalAndNull(overheadCombinedCost, initialConfiguration.NoOfDecimalForPrice))
              setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(overheadTotalCost, initialConfiguration.NoOfDecimalForPrice))
              setIsSurfaceTreatmentAdded(false)
              setOverheadObj({
                ...overheadObj,
                OverheadCombinedCost: overheadCombinedCost,
                OverheadCombinedTotalCost: overheadTotalCost,
              })
              break;

            case 'BOP + CC':
              const BOPCC = headerCosts.NetBoughtOutPartCost + NetConversionCost;
              overheadCombinedCost = BOPCC
              overheadTotalCost = overheadCombinedCost * calculatePercentage(OverheadPercentage)
              setValue('OverheadPercentage', OverheadPercentage)
              setValue('OverheadCombinedCost', checkForDecimalAndNull(overheadCombinedCost, initialConfiguration.NoOfDecimalForPrice))
              setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(overheadTotalCost, initialConfiguration.NoOfDecimalForPrice))
              setIsSurfaceTreatmentAdded(false)
              setOverheadObj({
                ...overheadObj,
                OverheadCombinedCost: overheadCombinedCost,
                OverheadCombinedTotalCost: overheadTotalCost,
              })
              break;
            case 'RM + BOP':
              const RMBOP = (IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost) + headerCosts.NetBoughtOutPartCost;
              overheadCombinedCost = RMBOP
              overheadTotalCost = overheadCombinedCost * calculatePercentage(OverheadPercentage)
              setValue('OverheadPercentage', OverheadPercentage)
              setValue('OverheadCombinedCost', checkForDecimalAndNull(overheadCombinedCost, initialConfiguration.NoOfDecimalForPrice))
              setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(overheadTotalCost, initialConfiguration.NoOfDecimalForPrice))
              setOverheadObj({
                ...overheadObj,
                OverheadCombinedCost: overheadCombinedCost,
                OverheadCombinedTotalCost: overheadTotalCost,
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
          let profitCombinedCost = 0
          let profitTotalCost = 0
          switch (ProfitApplicability) {
            case 'RM + CC + BOP':
              profitCombinedCost = CutOffRMBOPCCTotal + NetSurfaceTreatmentCost
              profitTotalCost = profitCombinedCost * calculatePercentage(ProfitPercentage)
              setValue('ProfitPercentage', ProfitPercentage)
              setValue('ProfitCombinedCost', checkForDecimalAndNull(profitCombinedCost, initialConfiguration.NoOfDecimalForPrice))
              setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration.NoOfDecimalForPrice))
              setIsSurfaceTreatmentAdded(true)
              setProfitObj({
                ...profitObj,
                ProfitCombinedCost: profitCombinedCost,
                ProfitCombinedTotalCost: profitTotalCost,
              })
              break;

            case 'RM + CC':
              const RMCC = (IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost) + NetConversionCost;
              profitCombinedCost = RMCC + NetSurfaceTreatmentCost
              profitTotalCost = profitCombinedCost * calculatePercentage(ProfitPercentage)
              setValue('ProfitPercentage', ProfitPercentage)
              setValue('ProfitCombinedCost', checkForDecimalAndNull(profitCombinedCost, initialConfiguration.NoOfDecimalForPrice))
              setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration.NoOfDecimalForPrice))
              setIsSurfaceTreatmentAdded(true)
              setProfitObj({
                ...profitObj,
                ProfitCombinedCost: profitCombinedCost,
                ProfitCombinedTotalCost: profitTotalCost
              })
              break;

            case 'BOP + CC':
              const BOPCC = headerCosts.NetBoughtOutPartCost + NetConversionCost;
              profitCombinedCost = BOPCC + NetSurfaceTreatmentCost
              profitTotalCost = profitCombinedCost * calculatePercentage(ProfitPercentage)
              setValue('ProfitPercentage', ProfitPercentage)
              setValue('ProfitCombinedCost', checkForDecimalAndNull(profitCombinedCost, initialConfiguration.NoOfDecimalForPrice))
              setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration.NoOfDecimalForPrice))
              setIsSurfaceTreatmentAdded(true)
              setProfitObj({
                ...profitObj,
                ProfitCombinedCost: profitCombinedCost,
                ProfitCombinedTotalCost: profitTotalCost,
              })
              break;
            case 'RM + BOP':
              const RMBOP = (IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost) + headerCosts.NetBoughtOutPartCost;
              profitCombinedCost = RMBOP
              profitTotalCost = profitCombinedCost * calculatePercentage(ProfitPercentage)
              setValue('ProfitPercentage', ProfitPercentage)
              setValue('ProfitCombinedCost', checkForDecimalAndNull(profitCombinedCost, initialConfiguration.NoOfDecimalForPrice))
              setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration.NoOfDecimalForPrice))
              setProfitObj({
                ...profitObj,
                ProfitPercentage: ProfitPercentage,
                ProfitCombinedCost: profitCombinedCost,
                ProfitCombinedTotalCost: profitTotalCost,
              })
              break;

            default:
              break;
          }

        } else if (!IsIncludedSurfaceInOverheadProfit && profitObj && profitObj.IsProfitCombined) {
          const { ProfitApplicability, ProfitPercentage } = profitObj;
          let profitCombinedCost = 0
          let profitTotalCost = 0
          switch (ProfitApplicability) {
            case 'RM + CC + BOP':
              profitCombinedCost = CutOffRMBOPCCTotal
              profitTotalCost = profitCombinedCost * calculatePercentage(ProfitPercentage)
              setValue('ProfitPercentage', ProfitPercentage)
              setValue('ProfitCombinedCost', checkForDecimalAndNull(profitCombinedCost, initialConfiguration.NoOfDecimalForPrice))
              setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration.NoOfDecimalForPrice))
              setIsSurfaceTreatmentAdded(false)
              setProfitObj({
                ...profitObj,
                ProfitPercentage: ProfitPercentage,
                ProfitCombinedCost: profitCombinedCost,
                ProfitCombinedTotalCost: profitTotalCost,
              })
              break;

            case 'RM + CC':
              const RMCC = (IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost) + NetConversionCost;
              profitCombinedCost = RMCC
              profitTotalCost = profitCombinedCost * calculatePercentage(ProfitPercentage)
              setValue('ProfitPercentage', ProfitPercentage)
              setValue('ProfitCombinedCost', checkForDecimalAndNull(profitCombinedCost, initialConfiguration.NoOfDecimalForPrice))
              setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration.NoOfDecimalForPrice))
              setIsSurfaceTreatmentAdded(false)
              setProfitObj({
                ...profitObj,
                ProfitPercentage: ProfitPercentage,
                ProfitCombinedCost: profitCombinedCost,
                ProfitCombinedTotalCost: profitTotalCost
              })
              break;

            case 'BOP + CC':
              const BOPCC = headerCosts.NetBoughtOutPartCost + NetConversionCost;
              profitCombinedCost = BOPCC
              profitTotalCost = profitCombinedCost * calculatePercentage(ProfitPercentage)
              setValue('ProfitPercentage', ProfitPercentage)
              setValue('ProfitCombinedCost', checkForDecimalAndNull(profitCombinedCost, initialConfiguration.NoOfDecimalForPrice))
              setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration.NoOfDecimalForPrice))
              setIsSurfaceTreatmentAdded(false)
              setProfitObj({
                ...profitObj,
                ProfitPercentage: ProfitPercentage,
                ProfitCombinedCost: profitCombinedCost,
                ProfitCombinedTotalCost: profitTotalCost,
              })
              break;
            case 'RM + BOP':
              const RMBOP = (IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost) + headerCosts.NetBoughtOutPartCost;
              profitCombinedCost = RMBOP
              profitTotalCost = profitCombinedCost * calculatePercentage(ProfitPercentage)
              setValue('ProfitPercentage', ProfitPercentage)
              setValue('ProfitCombinedCost', checkForDecimalAndNull(profitCombinedCost, initialConfiguration.NoOfDecimalForPrice))
              setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration.NoOfDecimalForPrice))
              setProfitObj({
                ...profitObj,
                ProfitPercentage: ProfitPercentage,
                ProfitCombinedCost: profitCombinedCost,
                ProfitCombinedTotalCost: profitTotalCost,
              })
              break;

            default:
              break;
          }
          // END HERE ADD CC IN PROFIT COMBINED
        }
        dispatch(isOverheadProfitDataChange(true))
      }
    }
  }

  const resetData = () => {
    setValue('ModelType', '')
    setOverheadObj({})
    setProfitObj({})
  }
  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  const onSubmit = debounce(handleSubmit((values) => {
    props.saveCosting(values)
  }), 500);

  /**
  * @method render
  * @description Renders the component
  */

  const showValueInInput = () => {
    let value = checkForDecimalAndNull(checkForNull(data.CostingPartDetails?.OverheadCost) + checkForNull(data.CostingPartDetails?.ProfitCost), initialConfiguration.NoOfDecimalForPrice);
    return value === 0 ? '' : value;
  }
  return (
    <>
      <div className="user-page p-0">
        <div>
          <form noValidate className="form">
            <Row>
              <Col md="12">
                <div className="left-border">
                  {'Overheads & Profits:'}
                </div>
              </Col>
            </Row>

            <Row className="costing-border px-2 py-4 m-0 overhead-profit-tab-costing">

              <Col md="3">
                <SearchableSelectHookForm
                  label={'Model Type for Overheads/Profits'}
                  name={'ModelType'}
                  placeholder={'Select'}
                  Controller={Controller}
                  control={control}
                  rules={{ required: false }}
                  register={register}
                  defaultValue={modelType.length !== 0 ? modelType : ''}
                  options={renderListing('ModelType')}
                  mandatory={false}
                  disabled={CostingViewMode ? true : false}
                  handleChange={(ModelTypeValues) => {
                    handleModelTypeChange(ModelTypeValues, true)
                  }}
                  errors={errors.ModelType}
                  buttonCross={resetData}
                />
              </Col>

              <Col md="3" className='pl-0'>
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
                <input placeholder='-' className="form-control" disabled value={showValueInInput()} />
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
                      {'Cost (Applicability)'}
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
                          handleChange={() => { dispatch(isOverheadProfitDataChange(true)) }}
                          defaultValue={overheadObj.OverheadFixedPercentage !== null ? checkForDecimalAndNull(overheadObj.OverheadFixedPercentage, initialConfiguration.NoOfDecimalForPrice) : ''}
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
                          handleChange={() => { dispatch(isOverheadProfitDataChange(true)) }}
                          defaultValue={overheadObj.OverheadFixedCost !== null ? checkForDecimalAndNull(overheadObj.OverheadFixedCost, initialConfiguration.NoOfDecimalForPrice) : ''}
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
                          defaultValue={overheadObj.OverheadFixedTotalCost !== null ? checkForDecimalAndNull(overheadObj.OverheadFixedTotalCost, initialConfiguration.NoOfDecimalForPrice) : ''}
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
                          defaultValue={overheadObj.OverheadPercentage !== null ? checkForDecimalAndNull(overheadObj.OverheadPercentage, initialConfiguration.NoOfDecimalForPrice) : ''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.OverheadPercentage}
                          disabled={true}
                        />
                      </Col>
                      <Col md="3">
                        <div className="d-inline-block tooltip-container">
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
                          /> {overheadObj?.OverheadApplicability.includes('RM') && CostingDataList[0]?.IsRMCutOffApplicable && checkForNull(CostingDataList && CostingDataList[0]?.RawMaterialCostWithCutOff) > 0 &&
                            <span className={'fa fa-info-circle mt9 tooltip-n tooltip_custom_right mb-n3'}>
                              <span class="tooltiptext">{`RM cut-off price ${checkForDecimalAndNull(CostingDataList && CostingDataList[0]?.RawMaterialCostWithCutOff, initialConfiguration.NoOfDecimalForPrice)} applied`}</span>
                            </span>
                          }
                        </div>
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
                          defaultValue={overheadObj.OverheadCombinedTotalCost !== null ? checkForDecimalAndNull(overheadObj.OverheadCombinedTotalCost, initialConfiguration.NoOfDecimalForPrice) : ''}
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
                          defaultValue={overheadObj.OverheadRMPercentage !== null ? checkForDecimalAndNull(overheadObj.OverheadRMPercentage, initialConfiguration.NoOfDecimalForPrice) : ''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.OverheadRMPercentage}
                          disabled={true}
                        />
                      </Col>
                      <Col md="3">
                        <div className="d-inline-block tooltip-container">
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
                          />
                          {CostingDataList[0]?.IsRMCutOffApplicable && checkForNull(CostingDataList && CostingDataList[0]?.RawMaterialCostWithCutOff) > 0 &&
                            <span className={'fa fa-info-circle mt9 tooltip-n tooltip_custom_right mb-n3 costing-tooltip'}>
                              <span class="tooltiptext">{`RM cut-off price ${checkForDecimalAndNull(CostingDataList && CostingDataList[0]?.RawMaterialCostWithCutOff, initialConfiguration.NoOfDecimalForPrice)} applied`}</span>
                            </span>}
                        </div>
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
                          defaultValue={overheadObj.OverheadRMTotalCost !== null ? checkForDecimalAndNull(overheadObj.OverheadRMTotalCost, initialConfiguration.NoOfDecimalForPrice) : ''}
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
                          defaultValue={overheadObj.OverheadBOPPercentage !== null ? checkForDecimalAndNull(overheadObj.OverheadBOPPercentage, initialConfiguration.NoOfDecimalForPrice) : ''}
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
                          defaultValue={overheadObj.OverheadBOPTotalCost !== null ? checkForDecimalAndNull(overheadObj.OverheadBOPTotalCost, initialConfiguration.NoOfDecimalForPrice) : ''}
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
                          defaultValue={overheadObj.OverheadCCPercentage !== null ? checkForDecimalAndNull(overheadObj.OverheadCCPercentage, initialConfiguration.NoOfDecimalForPrice) : ''}
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
                          defaultValue={overheadObj.OverheadCCTotalCost !== null ? checkForDecimalAndNull(overheadObj.OverheadCCTotalCost, initialConfiguration.NoOfDecimalForPrice) : ''}
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
                  {`Profits ${profitObj && profitObj.ProfitApplicability ? '(' + profitObj.ProfitApplicability + ')' : ''}`}
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
                      {'Cost (Applicability)'}
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
                          defaultValue={profitObj.ProfitFixedPercentage !== null ? checkForDecimalAndNull(profitObj.ProfitFixedPercentage, initialConfiguration.NoOfDecimalForPrice) : ''}
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
                          defaultValue={profitObj.ProfitFixedCost !== null ? checkForDecimalAndNull(profitObj.ProfitFixedCost, initialConfiguration.NoOfDecimalForPrice) : ''}
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
                          defaultValue={profitObj.ProfitFixedTotalCost !== null ? checkForDecimalAndNull(profitObj.ProfitFixedTotalCost, initialConfiguration.NoOfDecimalForPrice) : ''}
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
                          defaultValue={profitObj.ProfitPercentage !== null ? checkForDecimalAndNull(profitObj.ProfitPercentage, initialConfiguration.NoOfDecimalForPrice) : ''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.ProfitPercentage}
                          disabled={true}
                        />
                      </Col>
                      <Col md="3">
                        <div className="d-inline-block tooltip-container">
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
                          />
                          {profitObj?.ProfitApplicability.includes('RM') && CostingDataList[0]?.IsRMCutOffApplicable && checkForNull(CostingDataList && CostingDataList[0]?.RawMaterialCostWithCutOff) > 0 &&
                            <span className={'fa fa-info-circle mt9 tooltip-n tooltip_custom_right costing-tooltip mb-n3'}>
                              <span class="tooltiptext">{`RM cut-off price ${checkForDecimalAndNull(CostingDataList && CostingDataList[0]?.RawMaterialCostWithCutOff, initialConfiguration.NoOfDecimalForPrice)} applied`}</span>
                            </span>
                          }</div>
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
                          defaultValue={profitObj.ProfitCombinedTotalCost !== null ? checkForDecimalAndNull(profitObj.ProfitCombinedTotalCost, initialConfiguration.NoOfDecimalForPrice) : ''}
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
                          defaultValue={profitObj.ProfitRMPercentage !== null ? checkForDecimalAndNull(profitObj.ProfitRMPercentage, initialConfiguration.NoOfDecimalForPrice) : ''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.ProfitRMPercentage}
                          disabled={true}
                        />
                      </Col>
                      <Col md="3">
                        <div className="d-inline-block tooltip-container">
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
                          />
                          {CostingDataList[0]?.IsRMCutOffApplicable && checkForNull(CostingDataList && CostingDataList[0]?.RawMaterialCostWithCutOff) > 0 &&
                            <span className={'fa fa-info-circle mt9 tooltip-n tooltip_custom_right costing-tooltip mb-n3'}>
                              <span class="tooltiptext">{`RM cut-off price ${checkForDecimalAndNull(CostingDataList && CostingDataList[0]?.RawMaterialCostWithCutOff, initialConfiguration.NoOfDecimalForPrice)} applied`}</span>
                            </span>
                          }</div>
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
                          defaultValue={profitObj.ProfitRMTotalCost !== null ? checkForDecimalAndNull(profitObj.ProfitRMTotalCost, initialConfiguration.NoOfDecimalForPrice) : ''}
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
                          defaultValue={profitObj.ProfitBOPPercentage !== null ? checkForDecimalAndNull(profitObj.ProfitBOPPercentage, initialConfiguration.NoOfDecimalForPrice) : ''}
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
                          defaultValue={profitObj.ProfitBOPTotalCost !== null ? checkForDecimalAndNull(profitObj.ProfitBOPTotalCost, initialConfiguration.NoOfDecimalForPrice) : ''}
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
                          defaultValue={profitObj.ProfitCCPercentage !== null ? checkForDecimalAndNull(profitObj.ProfitCCPercentage, initialConfiguration.NoOfDecimalForPrice) : ''}
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
                          defaultValue={profitObj.ProfitCCTotalCost !== null ? checkForDecimalAndNull(profitObj.ProfitCCTotalCost, initialConfiguration.NoOfDecimalForPrice) : ''}
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
              CostingInterestRateDetail={CostingInterestRateDetail}
              PaymentTermDetail={PaymentTermDetail}
              data={data}
              setPaymentTermsDetail={props.setPaymentTermsDetail}
            />

            <Row className=" no-gutters justify-content-between btn-sticky-container overhead-profit-save-btn">
              <div className="col-sm-12 text-right bluefooter-butn ">
                {!CostingViewMode && <button
                  type={'button'}
                  onClick={onSubmit}
                  className="submit-button save-btn">
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