import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller, useWatch, } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Row, } from 'reactstrap';
import { SearchableSelectHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs';
import { calculatePercentage, checkForDecimalAndNull, checkForNull, CheckIsCostingDateSelected, } from '../../../../../helper';
import { fetchModelTypeAPI, getPaymentTermsAppliSelectListKeyValue } from '../../../../../actions/Common';
import { getOverheadProfitDataByModelType, gridDataAdded, isOverheadProfitDataChange, } from '../../../actions/Costing';
import { costingInfoContext, netHeadCostContext, SurfaceCostContext } from '../../CostingDetailStepTwo';
import { EMPTY_GUID } from '../../../../../config/constants';
import { ViewCostingContext } from '../../CostingDetails';
import Rejection from './Rejection';
import Icc from './Icc';
import PaymentTerms from './PaymentTerms';
import { Link } from 'react-scroll'

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
  const [tempOverheadObj,setTempOverheadObj] = useState(CostingOverheadDetail)
  const [tempProfitObj,setTempProfitObj] = useState(CostingProfitDetail)
 


  const [modelType, setModelType] = useState(data.CostingPartDetails && data.CostingPartDetails.ModelType !== null ? { label: data.CostingPartDetails.ModelType, value: data.CostingPartDetails.ModelTypeId } : [])


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
        "OverheadCCPercentage": overheadObj && overheadObj.IsOverheadCCApplicable ? tempOverheadObj.OverheadCCPercentage: '',
        "OverheadCCCost": overheadObj && overheadObj.IsOverheadCCApplicable ? tempOverheadObj.OverheadCCCost : '',
        "OverheadCCTotalCost": overheadObj && overheadObj.IsOverheadCCApplicable ? tempOverheadObj.OverheadCCTotalCost : '',

        "IsOverheadBOPApplicable": overheadObj && overheadObj.IsOverheadBOPApplicable,
        "OverheadBOPPercentage": overheadObj && overheadObj.IsOverheadBOPApplicable ? tempOverheadObj.OverheadBOPPercentage : '',
        "OverheadBOPCost": overheadObj && overheadObj.IsOverheadBOPApplicable ? tempOverheadObj.OverheadBOPCost : '',
        "OverheadBOPTotalCost": overheadObj && overheadObj.IsOverheadBOPApplicable ? tempOverheadObj.OverheadBOPTotalCost : '',

        "IsOverheadRMApplicable": overheadObj && overheadObj.IsOverheadRMApplicable,
        "OverheadRMPercentage": overheadObj && overheadObj.IsOverheadRMApplicable ? tempOverheadObj.OverheadRMPercentage : '',
        "OverheadRMCost": overheadObj && overheadObj.IsOverheadRMApplicable ? tempOverheadObj.OverheadRMCost : '',
        "OverheadRMTotalCost": overheadObj && overheadObj.IsOverheadRMApplicable ?tempOverheadObj.OverheadRMTotalCost : '',

        "IsOverheadFixedApplicable": overheadObj && overheadObj.IsOverheadFixedApplicable,
        "OverheadFixedPercentage": overheadObj && overheadObj.IsOverheadFixedApplicable ?overheadObj.OverheadFixedPercentage: '',
        "OverheadFixedCost": overheadObj && overheadObj.IsOverheadFixedApplicable ? overheadObj.OverheadFixedCost : '',
        "OverheadFixedTotalCost": overheadObj && overheadObj.IsOverheadFixedApplicable ? overheadObj.OverheadFixedPercentage : '',

        "IsSurfaceTreatmentApplicable": IsIncludedSurfaceInOverheadProfit,
      }

      let profitTempObj = {
        "ProfitId": profitObj && profitObj.ProfitId,
        "ProfitApplicabilityId": profitObj && profitObj.ProfitApplicabilityId,
        "ProfitApplicability": profitObj && profitObj.ProfitApplicability,

        "IsProfitCombined": profitObj && profitObj.IsProfitCombined,
        "ProfitPercentage": profitObj && profitObj.IsProfitCombined ?profitObj.ProfitPercentage : '',
        "ProfitCombinedCost": profitObj && profitObj.IsProfitCombined ?profitObj.ProfitCombinedCost : '',
        "ProfitCombinedTotalCost": profitObj && profitObj.IsProfitCombined ?profitObj.ProfitCombinedTotalCost : '',

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

  }, [overheadObj, profitObj,tempOverheadObj,tempProfitObj]);

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
        dispatch(isOverheadProfitDataChange(true))
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
        dispatch(isOverheadProfitDataChange(true))
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


      setOverheadObj({})
      setProfitObj({})
      setOverheadValues({}, true)
      setProfitValues({}, true)
      setIsSurfaceTreatmentAdded(false)
      if (newValue && newValue !== '' && newValue.value !== undefined && costData.IsVendor !== undefined) {
        dispatch(isOverheadProfitDataChange(true))
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

      if (dataObj.IsOverheadRMApplicable) {
        
        setValue('OverheadRMPercentage',dataObj.OverheadRMPercentage)
        setValue('OverheadRMCost', IsCutOffApplicable ? checkForDecimalAndNull(CutOffRMC, initialConfiguration.NoOfDecimalForPrice) : checkForDecimalAndNull(headerCosts.NetRawMaterialsCost, initialConfiguration.NoOfDecimalForPrice))   
        const totalOverheadCost = IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost * calculatePercentage(dataObj.OverheadRMPercentage)        
        setValue('OverheadRMTotalCost', checkForDecimalAndNull(totalOverheadCost, initialConfiguration.NoOfDecimalForPrice))
        setTempOverheadObj({
             ...tempOverheadObj,
              OverheadRMPercentage:dataObj.OverheadRMPercentage,
              OverheadRMCost: IsCutOffApplicable ? CutOffRMC:headerCosts.NetRawMaterialsCost , 
              OverheadRMTotalCost:totalOverheadCost
        })
       
      }

      if (dataObj.IsOverheadBOPApplicable) {
        setValue('OverheadBOPPercentage', dataObj.IsOverheadBOPApplicable ? dataObj.OverheadBOPPercentage : '')
        setValue('OverheadBOPCost', checkForDecimalAndNull(headerCosts && headerCosts.NetBoughtOutPartCost, initialConfiguration.NoOfDecimalForPrice))
        const totalOverheadCost = headerCosts.NetBoughtOutPartCost * calculatePercentage(dataObj.OverheadBOPPercentage)
        setValue('OverheadBOPTotalCost', checkForDecimalAndNull(totalOverheadCost, initialConfiguration.NoOfDecimalForPrice))
        setTempOverheadObj({
          ...tempOverheadObj,
          OverheadBOPPercentage:dataObj.OverheadBOPPercentage,
          OverheadBOPCost: IsCutOffApplicable ? CutOffRMC:headerCosts.NetBoughtOutPartCost , 
          OverheadBOPTotalCost:totalOverheadCost
        })
      }

      if (dataObj.IsOverheadCCApplicable) {
        
        setValue('OverheadCCPercentage', dataObj.IsOverheadCCApplicable ? dataObj.OverheadCCPercentage : '')
        setValue('OverheadCCCost', headerCosts && checkForDecimalAndNull(headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal, initialConfiguration.NoOfDecimalForPrice))
        const totalOverheadCost = headerCosts && (headerCosts?.ProcessCostTotal + headerCosts?.OperationCostTotal) * calculatePercentage(dataObj?.OverheadCCPercentage)
         setValue('OverheadCCTotalCost', checkForDecimalAndNull(totalOverheadCost, initialConfiguration.NoOfDecimalForPrice))
        setTempOverheadObj({
          ...tempOverheadObj,
          OverheadCCPercentage:dataObj.OverheadCCPercentage,
          OverheadCCCost:headerCosts && headerCosts?.ProcessCostTotal + headerCosts?.OperationCostTotal , 
          OverheadCCTotalCost:totalOverheadCost
       })
      }

      if(dataObj.IsOverheadRMApplicable && dataObj.IsOverheadCCApplicable){
        
        setValue('OverheadRMPercentage',dataObj.OverheadRMPercentage)
        setValue('OverheadRMCost', IsCutOffApplicable ? checkForDecimalAndNull(CutOffRMC, initialConfiguration.NoOfDecimalForPrice) : checkForDecimalAndNull(headerCosts.NetRawMaterialsCost, initialConfiguration.NoOfDecimalForPrice))   
        const totalOverheadRMCost = IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost * calculatePercentage(dataObj.OverheadRMPercentage)        
        setValue('OverheadRMTotalCost', checkForDecimalAndNull(totalOverheadRMCost, initialConfiguration.NoOfDecimalForPrice))
        setValue('OverheadCCPercentage', dataObj.IsOverheadCCApplicable ? dataObj.OverheadCCPercentage : '')
        setValue('OverheadCCCost', headerCosts && checkForDecimalAndNull(headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal, initialConfiguration.NoOfDecimalForPrice))
        const totalOverheadCCCost = headerCosts && (headerCosts?.ProcessCostTotal + headerCosts?.OperationCostTotal) * calculatePercentage(dataObj?.OverheadCCPercentage)
         setValue('OverheadCCTotalCost', checkForDecimalAndNull(totalOverheadCCCost, initialConfiguration.NoOfDecimalForPrice))
        setTempOverheadObj({
          ...tempOverheadObj,
          OverheadCCPercentage:dataObj.OverheadCCPercentage,
          OverheadCCCost:headerCosts && headerCosts?.ProcessCostTotal + headerCosts?.OperationCostTotal , 
          OverheadCCTotalCost:totalOverheadCCCost,
          OverheadRMPercentage:dataObj.OverheadRMPercentage,
          OverheadRMCost: IsCutOffApplicable ? CutOffRMC:headerCosts.NetRawMaterialsCost , 
          OverheadRMTotalCost:totalOverheadRMCost
       })
      }
      if(dataObj.IsOverheadRMApplicable && dataObj.IsOverheadBOPApplicable){
        
        setValue('OverheadRMPercentage',dataObj.OverheadRMPercentage)
        setValue('OverheadRMCost', IsCutOffApplicable ? checkForDecimalAndNull(CutOffRMC, initialConfiguration.NoOfDecimalForPrice) : checkForDecimalAndNull(headerCosts.NetRawMaterialsCost, initialConfiguration.NoOfDecimalForPrice))   
        const totalOverheadRMCost = IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost * calculatePercentage(dataObj.OverheadRMPercentage)        
        setValue('OverheadRMTotalCost', checkForDecimalAndNull(totalOverheadRMCost, initialConfiguration.NoOfDecimalForPrice))
        setValue('OverheadBOPPercentage', dataObj.IsOverheadBOPApplicable ? dataObj.OverheadBOPPercentage : '')
        setValue('OverheadBOPCost', checkForDecimalAndNull(headerCosts && headerCosts.NetBoughtOutPartCost, initialConfiguration.NoOfDecimalForPrice))
        const totalOverheadBOPCost = headerCosts.NetBoughtOutPartCost * calculatePercentage(dataObj.OverheadBOPPercentage)
        setValue('OverheadBOPTotalCost', checkForDecimalAndNull(totalOverheadBOPCost, initialConfiguration.NoOfDecimalForPrice))
        setTempOverheadObj({
          ...tempOverheadObj,
          OverheadBOPPercentage:dataObj.OverheadBOPPercentage,
          OverheadBOPCost: IsCutOffApplicable ? CutOffRMC:headerCosts.NetBoughtOutPartCost , 
          OverheadBOPTotalCost:totalOverheadBOPCost,
          OverheadRMPercentage:dataObj.OverheadRMPercentage,
          OverheadRMCost: IsCutOffApplicable ? CutOffRMC:headerCosts.NetRawMaterialsCost , 
          OverheadRMTotalCost:totalOverheadRMCost
       })
      }
      if(dataObj.IsOverheadBOPApplicable && dataObj.IsOverheadCCApplicable){
        
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
          OverheadCCPercentage:dataObj.OverheadCCPercentage,
          OverheadCCCost:headerCosts && headerCosts?.ProcessCostTotal + headerCosts?.OperationCostTotal , 
          OverheadCCTotalCost:totalOverheadCCCost,
          OverheadBOPPercentage:dataObj.OverheadBOPPercentage,
          OverheadBOPCost: IsCutOffApplicable ? CutOffRMC:headerCosts.NetBoughtOutPartCost , 
          OverheadBOPTotalCost:totalOverheadBOPCost,
       })
      }
    }
  }

  /**
  * @method setProfitValues
  * @description  SET PROFIT VALUES IN FIXED, COMBINED, RM, CC AND FIXED
  */
  const setProfitValues = (dataObj, IsAPIResponse) => {
    if (!CostingViewMode) {
      let profitTotalCost=0
      const { IsCutOffApplicable, CutOffRMC } = RMCCutOffObj;
      const RMBOPCC = headerCosts.NetRawMaterialsCost + headerCosts.NetBoughtOutPartCost + headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal
      const CutOffRMBOPCCTotal = IsCutOffApplicable && headerCosts ? CutOffRMC + headerCosts.NetBoughtOutPartCost + headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal : RMBOPCC; //NEED TO ASK HERE ALSO

      if (dataObj.IsProfitFixedApplicable && IsAPIResponse === false) {
        setValue('ProfitFixedPercentage', dataObj.IsProfitFixedApplicable ? dataObj.ProfitFixedPercentage : '')
        setValue('ProfitFixedCost', '-')
        setValue('ProfitFixedTotalCost', dataObj.IsProfitFixedApplicable ? checkForDecimalAndNull(dataObj.ProfitFixedPercentage, initialConfiguration.NoOfDecimalForPrice) : '')
        setProfitObj({
          ...profitObj,
          ProfitFixedPercentage:dataObj?.ProfitFixedPercentage,
          ProfitFixedCost:'-',
          ProfitFixedTotalCost:dataObj?.ProfitFixedPercentage
        })

      }

      if (dataObj.IsProfitCombined && IsAPIResponse === false) {
        setValue('ProfitPercentage', dataObj.IsProfitCombined ? dataObj.ProfitPercentage : '')
        setValue('ProfitCombinedCost', checkForDecimalAndNull(headerCosts && CutOffRMBOPCCTotal, initialConfiguration.NoOfDecimalForPrice))        //setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(headerCosts.NetTotalRMBOPCC * calculatePercentage(dataObj.ProfitPercentage), initialConfiguration.NoOfDecimalForPrice))
    
      }

      if (dataObj.IsProfitRMApplicable) {
        const profitRMCost = headerCosts && IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost
         profitTotalCost = profitRMCost * calculatePercentage(dataObj.ProfitRMPercentage)
        setValue('ProfitRMPercentage', dataObj.IsProfitRMApplicable ? dataObj.ProfitRMPercentage : '')
        setValue('ProfitRMCost', checkForDecimalAndNull(profitRMCost, initialConfiguration.NoOfDecimalForPrice))
        setValue('ProfitRMTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration.NoOfDecimalForPrice))
        setTempProfitObj({
          ...tempProfitObj,
          ProfitRMPercentage:dataObj.ProfitRMPercentage,
          ProfitRMCost:checkForNull(profitRMCost), 
          ProfitRMTotalCost:profitTotalCost
       })
      }

      if (dataObj.IsProfitBOPApplicable) {
        const profitBOPCost = headerCosts.NetBoughtOutPartCost
        profitTotalCost = profitBOPCost * calculatePercentage(dataObj.ProfitBOPPercentage)
        setValue('ProfitBOPPercentage', dataObj.IsProfitBOPApplicable ? dataObj.ProfitBOPPercentage : '')
        setValue('ProfitBOPCost', headerCosts && checkForDecimalAndNull(profitBOPCost, initialConfiguration.NoOfDecimalForPrice))
        setValue('ProfitBOPTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration.NoOfDecimalForPrice))
        setTempProfitObj({
          ...tempProfitObj,
          ProfitBOPPercentage:dataObj.ProfitBOPPercentage,
          ProfitBOPCost:checkForNull(profitBOPCost), 
          ProfitBOPTotalCost:profitTotalCost
       })
      }

      if (dataObj.IsProfitCCApplicable) {
        const profitCCCost = headerCosts && (headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal)
        profitTotalCost = profitCCCost * calculatePercentage(dataObj.ProfitCCPercentage)
        setValue('ProfitCCPercentage', dataObj.IsProfitCCApplicable ? dataObj.ProfitCCPercentage : '')
        setValue('ProfitCCCost', checkForDecimalAndNull(profitCCCost,initialConfiguration.NoOfDecimalForPrice))
        setValue('ProfitCCTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration.NoOfDecimalForPrice))
        setTempProfitObj({
          ...tempProfitObj,
          ProfitCCPercentage:dataObj.ProfitCCPercentage,
          ProfitCCCost:profitCCCost , 
          ProfitCCTotalCost:profitTotalCost
       })
      }
      if(dataObj.IsProfitRMApplicable && dataObj.IsProfitCCApplicable){
        const profitRMCost = headerCosts && IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost
      const  profitTotalRMCost = profitRMCost * calculatePercentage(dataObj.ProfitRMPercentage)
       setValue('ProfitRMPercentage', dataObj.IsProfitRMApplicable ? dataObj.ProfitRMPercentage : '')
       setValue('ProfitRMCost', checkForDecimalAndNull(profitRMCost, initialConfiguration.NoOfDecimalForPrice))
       setValue('ProfitRMTotalCost', checkForDecimalAndNull(profitTotalRMCost, initialConfiguration.NoOfDecimalForPrice))
      const profitCCCost = headerCosts && (headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal)
      const  profitTotalCCCost = profitCCCost * calculatePercentage(dataObj.ProfitCCPercentage)
      setValue('ProfitCCPercentage', dataObj.IsProfitCCApplicable ? dataObj.ProfitCCPercentage : '')
      setValue('ProfitCCCost', checkForDecimalAndNull(profitCCCost,initialConfiguration.NoOfDecimalForPrice))
      setValue('ProfitCCTotalCost', checkForDecimalAndNull(profitTotalCCCost, initialConfiguration.NoOfDecimalForPrice))
      setTempProfitObj({
        ...tempProfitObj,
        ProfitCCPercentage:dataObj.ProfitCCPercentage,
        ProfitCCCost:profitCCCost , 
        ProfitCCTotalCost:profitTotalCCCost,
        ProfitRMPercentage:dataObj.ProfitRMPercentage,
        ProfitRMCost:checkForNull(profitRMCost), 
        ProfitRMTotalCost:profitTotalRMCost
        })
      }

      if(dataObj.IsProfitRMApplicable && dataObj.IsProfitBOPApplicable){
        const profitRMCost = headerCosts && IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost
        const  profitTotalRMCost = profitRMCost * calculatePercentage(dataObj.ProfitRMPercentage)
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
          ProfitBOPPercentage:dataObj.ProfitBOPPercentage,
          ProfitBOPCost:checkForNull(profitBOPCost), 
          ProfitBOPTotalCost:profitTotalBOPCost,
          ProfitRMPercentage:dataObj.ProfitRMPercentage,
          ProfitRMCost:checkForNull(profitRMCost), 
          ProfitRMTotalCost:profitTotalRMCost
          })
      }
      if(dataObj.IsProfitBOPApplicable && dataObj.IsProfitCCApplicable){
        const profitBOPCost = headerCosts.NetBoughtOutPartCost
        const profitTotalBOPCost = profitBOPCost * calculatePercentage(dataObj.ProfitBOPPercentage)
        setValue('ProfitBOPPercentage', dataObj.IsProfitBOPApplicable ? dataObj.ProfitBOPPercentage : '')
        setValue('ProfitBOPCost', headerCosts && checkForDecimalAndNull(profitBOPCost, initialConfiguration.NoOfDecimalForPrice))
        setValue('ProfitBOPTotalCost', checkForDecimalAndNull(profitTotalBOPCost, initialConfiguration.NoOfDecimalForPrice))
        const profitCCCost = headerCosts && (headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal)
        const  profitTotalCCCost = profitCCCost * calculatePercentage(dataObj.ProfitCCPercentage)
        setValue('ProfitCCPercentage', dataObj.IsProfitCCApplicable ? dataObj.ProfitCCPercentage : '')
        setValue('ProfitCCCost', checkForDecimalAndNull(profitCCCost,initialConfiguration.NoOfDecimalForPrice))
        setValue('ProfitCCTotalCost', checkForDecimalAndNull(profitTotalCCCost, initialConfiguration.NoOfDecimalForPrice))
        setTempProfitObj({
          ...tempProfitObj,
          ProfitBOPPercentage:dataObj.ProfitBOPPercentage,
          ProfitBOPCost:checkForNull(profitBOPCost), 
          ProfitBOPTotalCost:profitTotalBOPCost,
          ProfitCCPercentage:dataObj.ProfitCCPercentage,
          ProfitCCCost:profitCCCost, 
          ProfitCCTotalCost:profitTotalCCCost,
          })
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
      const ConversionCostForCalculation = costData.IsAssemblyPart ? checkForNull(headerCosts.NetConversionCost) - checkForNull(headerCosts.TotalOtherOperationCostPerAssembly) : headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal
      const RMBOPCC = headerCosts.NetRawMaterialsCost + headerCosts.NetBoughtOutPartCost + ConversionCostForCalculation
      const CutOffRMBOPCCTotal = IsCutOffApplicable && headerCosts ? CutOffRMC + headerCosts.NetBoughtOutPartCost + ConversionCostForCalculation : RMBOPCC;
      const NetSurfaceTreatmentCost = SurfaceTreatmentCost && SurfaceTreatmentCost.NetSurfaceTreatmentCost !== undefined ? checkForNull(SurfaceTreatmentCost?.NetSurfaceTreatmentCost) : checkForNull(CostingDataList[0]?.NetSurfaceTreatmentCost);
      const NetConversionCost = ConversionCostForCalculation
      // START HERE ADD CC IN OVERHEAD
      if (IsIncludedSurfaceInOverheadProfit && IsSurfaceTreatmentAdded === false && overheadObj && overheadObj.IsOverheadCCApplicable) {

        const { OverheadCCPercentage } = overheadObj;
        const overheadCCCost = checkForNull(NetConversionCost) + checkForNull(NetSurfaceTreatmentCost)
        setValue('OverheadCCCost',checkForDecimalAndNull(overheadCCCost,initialConfiguration.NoOfDecimalForPrice))
        const totalOverheadCost =(checkForNull(NetConversionCost) + checkForNull(NetSurfaceTreatmentCost))* calculatePercentage(OverheadCCPercentage)
        setValue('OverheadCCTotalCost', checkForDecimalAndNull(totalOverheadCost, initialConfiguration.NoOfDecimalForPrice))
        setIsSurfaceTreatmentAdded(true)
        setOverheadObj({
          ...overheadObj,
          OverheadCCCost: overheadCCCost,
          OverheadCCTotalCost: totalOverheadCost,
        })
        setTempOverheadObj({
          ...tempOverheadObj,
          OverheadCCPercentage:OverheadCCPercentage,
          OverheadCCCost:overheadCCCost, 
          OverheadCCTotalCost:totalOverheadCost
       })

      } else if (!IsIncludedSurfaceInOverheadProfit && overheadObj && overheadObj.IsOverheadCCApplicable) {

        const { OverheadCCPercentage } = overheadObj;
        setValue('OverheadCCCost', headerCosts !== undefined ? checkForDecimalAndNull(NetConversionCost, initialConfiguration.NoOfDecimalForPrice) : 0)
        const totalOverheadCost =checkForNull(NetConversionCost) * calculatePercentage(OverheadCCPercentage)
        setValue('OverheadCCTotalCost', checkForDecimalAndNull(totalOverheadCost, initialConfiguration.NoOfDecimalForPrice))
        setIsSurfaceTreatmentAdded(false)
        setOverheadObj({
          ...overheadObj,
          OverheadCCCost: checkForNull(NetConversionCost),
          OverheadCCTotalCost: totalOverheadCost
        })
        setTempOverheadObj({
          ...tempOverheadObj,
          OverheadCCPercentage:OverheadCCPercentage,
          OverheadCCCost:checkForNull(NetConversionCost), 
          OverheadCCTotalCost:totalOverheadCost
       })

        // END HERE ADD CC IN OVERHEAD
      }

      // START ADD CC IN PROFIT
      if (IsIncludedSurfaceInOverheadProfit && IsSurfaceTreatmentAdded === false && profitObj && profitObj.IsProfitCCApplicable) {

        const { ProfitCCPercentage } = profitObj;
        const profitCCCost = checkForNull(NetConversionCost) + checkForNull(NetSurfaceTreatmentCost)
        const profitTotalCost = profitCCCost * calculatePercentage(ProfitCCPercentage)
        setValue('ProfitCCCost', checkForDecimalAndNull(profitCCCost,initialConfiguration.NoOfDecimalForPrice))
        setValue('ProfitCCTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration.NoOfDecimalForPrice))
        setIsSurfaceTreatmentAdded(true)
        setProfitObj({
          ...profitObj,
          ProfitCCCost:profitCCCost,
          ProfitCCTotalCost: profitTotalCost
        })
        setTempProfitObj({
          ...tempProfitObj,
          ProfitCCPercentage:ProfitCCPercentage,
          ProfitCCCost:profitCCCost , 
          ProfitCCTotalCost:profitTotalCost
       })
      } else if (!IsIncludedSurfaceInOverheadProfit && profitObj && profitObj.IsProfitCCApplicable) {

        const { ProfitCCPercentage } = profitObj;
        const profitCCCost = checkForNull(NetConversionCost)
        const profitTotalCost = profitCCCost * calculatePercentage(ProfitCCPercentage)
        setValue('ProfitCCCost',checkForDecimalAndNull(profitCCCost,initialConfiguration.NoOfDecimalForPrice))
        setValue('ProfitCCTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration.NoOfDecimalForPrice))
        setIsSurfaceTreatmentAdded(false)
        setProfitObj({
          ...profitObj,
          ProfitCCCost: profitCCCost,
          ProfitCCTotalCost:profitTotalCost,
        })
        setTempProfitObj({
          ...tempProfitObj,
          ProfitCCPercentage:ProfitCCPercentage,
          ProfitCCCost:profitCCCost, 
          ProfitCCTotalCost:profitTotalCost
       })
        // END HERE ADD CC IN PROFIT
      }

      // START ADD CC IN OVERHEAD COMBINED
      if (IsIncludedSurfaceInOverheadProfit && IsSurfaceTreatmentAdded === false && overheadObj && overheadObj.IsOverheadCombined) {
        const { OverheadApplicability, OverheadPercentage } = overheadObj;

        let overheadTotalCost=0
        let overheadCombinedCost=0
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
              OverheadCombinedTotalCost:overheadTotalCost,
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
        let overheadTotalCost=0
        let overheadCombinedCost=0
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
              OverheadCombinedCost:overheadCombinedCost,
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
        let profitCombinedCost=0
        let profitTotalCost=0
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
              ProfitCombinedTotalCost:profitTotalCost,
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
                ProfitPercentage:ProfitPercentage,
                ProfitCombinedCost: profitCombinedCost,
                ProfitCombinedTotalCost: profitTotalCost,
              })
              break;

          default:
            break;
        }

      } else if (!IsIncludedSurfaceInOverheadProfit && profitObj && profitObj.IsProfitCombined) {
        const { ProfitApplicability, ProfitPercentage } = profitObj;
        let profitCombinedCost=0
        let profitTotalCost=0
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
              ProfitPercentage:ProfitPercentage,
              ProfitCombinedCost: profitCombinedCost,
              ProfitCombinedTotalCost: profitTotalCost,
            })
            break;

          case 'RM + CC':
            const RMCC = (IsCutOffApplicable ? CutOffRMC : headerCosts.NetRawMaterialsCost)  + NetConversionCost;
            profitCombinedCost = RMCC 
            profitTotalCost = profitCombinedCost * calculatePercentage(ProfitPercentage)
            setValue('ProfitPercentage', ProfitPercentage)
            setValue('ProfitCombinedCost', checkForDecimalAndNull(profitCombinedCost, initialConfiguration.NoOfDecimalForPrice))
            setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration.NoOfDecimalForPrice))
            setIsSurfaceTreatmentAdded(false)
            setProfitObj({
              ...profitObj,
              ProfitPercentage:ProfitPercentage,
              ProfitCombinedCost: profitCombinedCost,
              ProfitCombinedTotalCost: profitTotalCost
            })
            break;

          case 'BOP + CC':
            const BOPCC = headerCosts.NetBoughtOutPartCost + NetConversionCost ;
            profitCombinedCost = BOPCC 
            profitTotalCost = profitCombinedCost * calculatePercentage(ProfitPercentage)
            setValue('ProfitPercentage', ProfitPercentage)
            setValue('ProfitCombinedCost', checkForDecimalAndNull(profitCombinedCost, initialConfiguration.NoOfDecimalForPrice))
            setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration.NoOfDecimalForPrice))
            setIsSurfaceTreatmentAdded(false)
            setProfitObj({
              ...profitObj,
              ProfitPercentage:ProfitPercentage,
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
                ProfitPercentage:ProfitPercentage,
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
                  placeholder={'-Select-'}
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
                          defaultValue={overheadObj.OverheadPercentage !== null ? overheadObj.OverheadPercentage : ''}
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
                          /> {overheadObj?.OverheadApplicability.includes('RM') && RMCCutOffObj?.IsCutOffApplicable && RMCCutOffObj?.CutOffRMC > 0 &&
                          <span className={'fa fa-info-circle mt9 tooltip-n tooltip_custom_right mb-n3'}>
                            <span class="tooltiptext">{`RM cut-off price ${RMCCutOffObj.CutOffRMC} applied`}</span>
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
                          defaultValue={overheadObj.OverheadRMPercentage !== null ? overheadObj.OverheadRMPercentage : ''}
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
                           {RMCCutOffObj?.IsCutOffApplicable && RMCCutOffObj?.CutOffRMC > 0 &&
                            <span className={'fa fa-info-circle mt9 tooltip-n tooltip_custom_right mb-n3 costing-tooltip'}>
                              <span class="tooltiptext">{`RM cut-off price ${RMCCutOffObj.CutOffRMC} applied`}</span>
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
                           {profitObj?.ProfitApplicability.includes('RM') && RMCCutOffObj?.IsCutOffApplicable && RMCCutOffObj?.CutOffRMC > 0 &&
                            <span className={'fa fa-info-circle mt9 tooltip-n tooltip_custom_right costing-tooltip mb-n3'}>
                              <span class="tooltiptext">{`RM cut-off price ${RMCCutOffObj.CutOffRMC} applied`}</span>
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
                          {RMCCutOffObj?.IsCutOffApplicable && RMCCutOffObj?.CutOffRMC > 0 &&
                            <span className={'fa fa-info-circle mt9 tooltip-n tooltip_custom_right costing-tooltip mb-n3'}>
                              <span class="tooltiptext">{`RM cut-off price ${RMCCutOffObj.CutOffRMC} applied`}</span>
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
              CostingInterestRateDetail={CostingInterestRateDetail}
              PaymentTermDetail={PaymentTermDetail}
              data={data}
              setPaymentTermsDetail={props.setPaymentTermsDetail}
            />

            <Row className=" no-gutters justify-content-between btn-stciky-container overhead-profit-save-btn">
              <div className="col-sm-12 text-right bluefooter-butn ">
                {!CostingViewMode && <Link to="assembly-costing-header" spy={true} smooth={true} offset={-330} delay={200}> <button
                  type={'submit'}
                  onClick={handleSubmit(onSubmit)}
                  className="submit-button mr5 save-btn">
                  <div className={"save-icon"}></div>
                  {'Save'}
                </button></Link>}
              </div>
            </Row>
          </form>
        </div>
      </div>

    </ >
  );
}

export default React.memo(OverheadProfit);