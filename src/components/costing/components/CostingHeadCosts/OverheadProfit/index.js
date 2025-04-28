import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller, useWatch, } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Row, } from 'reactstrap';
import { SearchableSelectHookForm, TextAreaHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs';
import { calculatePercentage, checkForDecimalAndNull, checkForNull, CheckIsCostingDateSelected, getConfigurationKey, isMultiTechnologyCosting, OverheadAndProfitTooltip, } from '../../../../../helper';
import { fetchModelTypeAPI } from '../../../../../actions/Common';
import { getOverheadProfitDataByModelType, gridDataAdded, isOverheadProfitDataChange, setOverheadProfitErrors, } from '../../../actions/Costing';
import { costingInfoContext, netHeadCostContext, SurfaceCostContext } from '../../CostingDetailStepTwo';
import { CBCTypeId, CRMHeads, EMPTY_GUID, NFRTypeId, PART_COST, PFS1TypeId, PFS2TypeId, PFS3TypeId, VBCTypeId, WACTypeId, ZBCTypeId } from '../../../../../config/constants';
import { SelectedCostingDetail, ViewCostingContext } from '../../CostingDetails';
import Rejection from './Rejection';
import Icc from './Icc';
import { Link } from 'react-scroll'
import { ASSEMBLY, IdForMultiTechnology, REMARKMAXLENGTH } from '../../../../../config/masterData';
import _, { debounce } from 'lodash';
import { number, checkWhiteSpaces, decimalNumberLimit6 } from "../../../../../helper/validation";
import TooltipCustom from '../../../../common/Tooltip';
import Popup from 'reactjs-popup';
import Toaster from '../../../../common/Toaster';
import WarningMessage from '../../../../common/WarningMessage';
import OverheadProfitTable from './OverheadProfitTable';

let counter = 0;

export const tooltipTextFunc = (id, condition, text) => {

  return ""
  // {(CostingDataList && CostingDataList[0]?.IsRMCutOffApplicable === true) &&
  //     <TooltipCustom id="OverheadRMCost" customClass="mt-2" tooltipText={`RM cut-off price ${checkForDecimalAndNull(CostingDataList && CostingDataList[0]?.RawMaterialCostWithCutOff, initialConfiguration?.NoOfDecimalForPrice)} applied`} />}
}
function OverheadProfit(props) {

  const { data } = props;

  const { CostingOverheadDetail, CostingProfitDetail, CostingRejectionDetail, CostingInterestRateDetail } = props.data?.CostingPartDetails;

  const ICCApplicabilityDetail = CostingInterestRateDetail && CostingInterestRateDetail.ICCApplicabilityDetail !== null ? CostingInterestRateDetail.ICCApplicabilityDetail : {}

  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)

  const defaultValues = {
    overHeadRemark: CostingOverheadDetail?.Remark ? CostingOverheadDetail?.Remark : '',
    crmHeadOverhead: CostingOverheadDetail && CostingOverheadDetail.OverheadCRMHead && { label: CostingOverheadDetail.OverheadCRMHead, value: 1 },
    //REJECTION FIELDS
    Applicability: CostingRejectionDetail && CostingRejectionDetail.RejectionApplicability !== null ? { label: CostingRejectionDetail.RejectionApplicability, value: CostingRejectionDetail.RejectionApplicabilityId } : '',
    RejectionPercentage: CostingRejectionDetail && CostingRejectionDetail.RejectionPercentage !== null ? CostingRejectionDetail.RejectionPercentage : '',
    RejectionCost: CostingRejectionDetail && CostingRejectionDetail.RejectionCost !== null ? checkForDecimalAndNull(CostingRejectionDetail.RejectionCost, initialConfiguration?.NoOfDecimalForPrice) : '',
    RejectionTotalCost: CostingRejectionDetail && CostingRejectionDetail.RejectionTotalCost !== null ? checkForDecimalAndNull(CostingRejectionDetail.RejectionTotalCost, initialConfiguration?.NoOfDecimalForPrice) : '',

    // ICC FIELDS
    InterestRatePercentage: ICCApplicabilityDetail !== null ? ICCApplicabilityDetail.InterestRate : '',
    InterestRateCost: ICCApplicabilityDetail !== null ? checkForDecimalAndNull(ICCApplicabilityDetail.CostApplicability, initialConfiguration?.NoOfDecimalForPrice) : '',
    NetICCTotal: ICCApplicabilityDetail !== null ? checkForDecimalAndNull(ICCApplicabilityDetail.NetCost, initialConfiguration?.NoOfDecimalForPrice) : '',
  }

  const { register, handleSubmit, control, clearErrors, setValue, getValues, formState: { errors } } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: defaultValues,
  });

  const dispatch = useDispatch()
  const headerCosts = useContext(netHeadCostContext);
  const costData = useContext(costingInfoContext);

  const CostingViewMode = useContext(ViewCostingContext);
  const SurfaceTreatmentCost = useContext(SurfaceCostContext);
  const costingHead = useSelector(state => state.comman.costingHead)

  const { CostingEffectiveDate, CostingDataList, IsIncludedSurfaceInOverheadProfit, IsIncludedToolCost, ToolTabData, OverheadProfitTabData, isBreakupBoughtOutPartCostingFromAPI, currencySource, exchangeRateData } = useSelector(state => state.costing)
  const [overheadObj, setOverheadObj] = useState(CostingOverheadDetail)

  const [profitObj, setProfitObj] = useState(CostingProfitDetail)


  const [tempOverheadObj, setTempOverheadObj] = useState(CostingOverheadDetail)
  const [tempProfitObj, setTempProfitObj] = useState(CostingProfitDetail)
  const [applicabilityList, setApplicabilityList] = useState(CostingProfitDetail)
  const [totalToolCost, setTotalToolCost] = useState(0)
  const [showWarning, setShowWarning] = useState('')
  const [showRefreshWarningMessage, setShowRefreshWarningMessage] = useState(false)
  // partType USED FOR MANAGING CONDITION IN CASE OF NORMAL COSTING AND ASSEMBLY TECHNOLOGY COSTING (TRUE FOR ASSEMBLY TECHNOLOGY)
  const partType = (IdForMultiTechnology.includes(String(costData?.TechnologyId)) || costData.CostingTypeId === WACTypeId)

  const [modelType, setModelType] = useState((data?.CostingPartDetails && data?.CostingPartDetails.ModelType !== null) ? { label: data?.CostingPartDetails?.ModelType, value: data?.CostingPartDetails?.ModelTypeId } : [])

  const [IsSurfaceTreatmentAdded, setIsSurfaceTreatmentAdded] = useState(false)

  //INITIAL CALLED EFFECT TO SET VALUES
  useEffect(() => {

    if (data?.CostingPartDetails && data?.CostingPartDetails?.ModelTypeId !== null) {
      handleModelTypeChange({ label: data?.CostingPartDetails?.ModelType, value: data?.CostingPartDetails?.ModelTypeId }, false)
    }

    // GET FIXED VALUE IN GET API
    // if (Object.keys(CostingOverheadDetail).length > 0) {
    //   setOverheadValues(CostingOverheadDetail, false)
    // }

    // //GET FIXED VALUE IN GET API
    // if (Object.keys(CostingProfitDetail).length > 0) {
    //   setProfitValues(CostingProfitDetail, false)
    //   setValue('crmHeadProfit', CostingProfitDetail && CostingProfitDetail.ProfitCRMHead && {
    //     label: CostingProfitDetail.ProfitCRMHead, value: 1
    //   })
    //   setValue('profitRemark', CostingProfitDetail && CostingProfitDetail.Remark ? CostingProfitDetail.Remark : '')
    // }

    setTimeout(() => {
      IncludeSurfaceTreatmentCall()
    }, 3000)

  }, []);


  useEffect(() => {
    IncludeSurfaceTreatmentCall()
  }, [IsIncludedSurfaceInOverheadProfit, IsIncludedToolCost])

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
    name: 'OverheadFixedCost',
  });

  const profitFixedFieldValues = useWatch({
    control,
    name: 'ProfitFixedCost',
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
        "OverheadCRMHead": overheadObj.OverheadCRMHead ? overheadObj.OverheadCRMHead : '',
        "Remark": overheadObj.Remark ? overheadObj.Remark : ''
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
        "ProfitCRMHead": profitObj.ProfitCRMHead ? profitObj.ProfitCRMHead : '',
        "Remark": profitObj.Remark ? profitObj.Remark : ''
      }


      if (!CostingViewMode) {
        props.setOverheadDetail({ overheadObj: tempObj, profitObj: profitTempObj, modelType: modelType }, { BOMLevel: data.BOMLevel, PartNumber: data.PartNumber })
      }
    }, 500)

  }, [overheadObj, profitObj, tempOverheadObj, tempProfitObj]);

  useEffect(() => {
    if (!CostingViewMode) {
      dispatch(fetchModelTypeAPI('--Model Types--', (res) => { }))
      setApplicabilityList(_.map(costingHead, 'Text'))
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
      if (headerCosts !== undefined && overheadFixedFieldValues !== undefined && overheadObj?.CostingApplicabilityDetails?.some(detail => detail.Applicability === 'Fixed')) {
        setValue('OverheadFixedTotalCost', checkForDecimalAndNull(overheadFixedFieldValues, initialConfiguration?.NoOfDecimalForPrice))
        setOverheadObj({
          ...overheadObj,
          OverheadFixedPercentage: overheadFixedFieldValues,
          OverheadFixedCost: getValues('OverheadFixedCost'),
          OverheadFixedTotalCost: overheadFixedFieldValues,
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
      if (headerCosts !== undefined && profitFixedFieldValues !== undefined && profitObj && profitObj?.CostingApplicabilityDetails?.some(detail => detail.Applicability === 'Fixed')) {
        setValue('ProfitFixedTotalCost', checkForDecimalAndNull(profitFixedFieldValues, initialConfiguration?.NoOfDecimalForPrice))
        setProfitObj({
          ...profitObj,
          ProfitFixedPercentage: profitFixedFieldValues,
          ProfitFixedCost: getValues('ProfitFixedCost'),
          ProfitFixedTotalCost: profitFixedFieldValues,
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
    // if(CheckIsCostingDateSelected(CostingEffectiveDate) && IsDropdownClicked){
    //   setModelType('')
    //   return false
    // } 
    
    if (IsDropdownClicked && !CostingViewMode && !CheckIsCostingDateSelected(CostingEffectiveDate, currencySource, exchangeRateData)) {
      dispatch(isOverheadProfitDataChange(true))

      setShowRefreshWarningMessage(true)
      setOverheadObj({})
      setProfitObj({})
      setOverheadValues({}, true)
      setProfitValues({}, true)
      setIsSurfaceTreatmentAdded(false)
      if (newValue && newValue !== '' && newValue.value !== undefined && costData.CostingTypeId !== undefined) {
        setModelType(newValue)

        const reqParams = {
          ModelTypeId: newValue.value,
          VendorId: (costData.CostingTypeId === VBCTypeId || costData.CostingTypeId === NFRTypeId) ? costData.VendorId : EMPTY_GUID,
          // costingTypeId: Number(costData.CostingTypeId) === NFRTypeId ? VBCTypeId : costData.CostingTypeId,
          costingTypeId: Number(costData.CostingTypeId) === NFRTypeId ? VBCTypeId : Number(costData.CostingTypeId === WACTypeId) ? ZBCTypeId : costData.CostingTypeId,
          EffectiveDate: CostingEffectiveDate,
          plantId: (getConfigurationKey()?.IsPlantRequiredForOverheadProfitInterestRate && costData?.CostingTypeId !== VBCTypeId) ? costData.PlantId : (getConfigurationKey()?.IsDestinationPlantConfigure && costData?.CostingTypeId === VBCTypeId) || (costData?.CostingTypeId === CBCTypeId) || (costData?.CostingTypeId === NFRTypeId) ? costData.DestinationPlantId : EMPTY_GUID,
          customerId: costData.CustomerId,
          rawMaterialGradeId: initialConfiguration?.IsShowRawMaterialInOverheadProfitAndICC ? OverheadProfitTabData[0]?.CostingPartDetails?.RawMaterialGradeId : EMPTY_GUID,
          rawMaterialChildId: initialConfiguration?.IsShowRawMaterialInOverheadProfitAndICC ? OverheadProfitTabData[0]?.CostingPartDetails?.RawMaterialChildId : EMPTY_GUID,
          technologyId: null,
        }

        dispatch(getOverheadProfitDataByModelType(reqParams, res => {
          if (res && res.data && res.data.Data) {
            let Data = res.data.Data;
            // console.log(Data,'Data')
            let showWarning = false
            if (Data?.CostingOverheadDetail?.CostingApplicabilityDetails?.some(detail => applicabilityList.includes(detail.Applicability))) {
              if (isBreakupBoughtOutPartCostingFromAPI) {
                showWarning = true
              } else {
                showWarning = false
              }
              setOverheadObj(Data?.CostingOverheadDetail)
              if (Data.CostingOverheadDetail) {
                setTimeout(() => {
                  setOverheadValues(Data.CostingOverheadDetail, true)
                }, 200)
              }
              dispatch(gridDataAdded(true))
            }
            if (Data?.CostingProfitDetail?.CostingApplicabilityDetails?.some(detail => applicabilityList.includes(detail.Applicability))) {
              console.log(Data?.CostingProfitDetail,'Data?.CostingProfitDetail')
              setProfitObj(Data.CostingProfitDetail)
              if (Data.CostingProfitDetail) {
                setTimeout(() => {
                  setProfitValues(Data.CostingProfitDetail, true)
                }, 200)
              }
              dispatch(gridDataAdded(true))
            }
            if (showWarning) {
              setShowWarning(true)
            } else {
              setShowWarning(false)
            }
            //setRejectionObj(Data.CostingRejectionDetail)
            // setIsSurfaceTreatmentAdded(false)
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
    // console.log(dataObj,'dataObj')
    let totalToolCost = 0
    if (IsIncludedToolCost) {
      totalToolCost = checkForDecimalAndNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost, initialConfiguration?.NoOfDecimalForPrice)
    } else {
      totalToolCost = 0
    }

    if (!CostingViewMode) {
      const CutOffCost = checkForNull(CostingDataList && CostingDataList[0]?.RawMaterialCostWithCutOff)
      const IsCutOffApplicable = CostingDataList[0]?.IsRMCutOffApplicable;

      // Process each applicability type
      dataObj?.CostingApplicabilityDetails?.forEach(detail => {
        const { Applicability, Percentage, Cost, TotalCost } = detail;

        switch(Applicability) {
          case 'Fixed':
            if (IsAPIResponse === false) {
              setValue('OverheadFixedPercentage', checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice) || '')
              setValue('OverheadFixedCost', '-')
              setValue('OverheadFixedTotalCost', checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice) || '')
            }
            break;

          case 'Combined':
            if (IsAPIResponse === false) {
              const RMBOPCC = headerCosts?.NetBoughtOutPartCost + headerCosts?.NetRawMaterialsCost + getCCCost("overhead")
              const CutOffRMBOPCCTotal = IsCutOffApplicable && headerCosts ? 
                CutOffCost + headerCosts?.NetBoughtOutPartCost + getCCCost("overhead") : 
                RMBOPCC;
              
              setValue('OverheadPercentage', checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice) || '')
              setValue('OverheadCombinedCost', headerCosts && checkForDecimalAndNull(CutOffRMBOPCCTotal, initialConfiguration?.NoOfDecimalForPrice))
              setValue('OverheadCombinedTotalCost', checkForDecimalAndNull((CutOffRMBOPCCTotal * calculatePercentage(Percentage)), initialConfiguration?.NoOfDecimalForPrice))
            }
            break;

          case 'RM':
            const rmCost = IsCutOffApplicable ? checkForNull(CutOffCost) : checkForNull(headerCosts?.NetRawMaterialsCost)
            const rmTotalCost = rmCost * calculatePercentage(Percentage)
            // console.log(rmCost,'rmCost')
            // console.log(rmTotalCost,'rmTotalCost')
            setValue('OverheadRMPercentage', checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice))
            setValue('OverheadRMCost', checkForDecimalAndNull(rmCost, initialConfiguration?.NoOfDecimalForPrice))
            setValue('OverheadRMTotalCost', checkForDecimalAndNull(rmTotalCost, initialConfiguration?.NoOfDecimalForPrice))
            break;

          case 'BOP':
            const bopCost = checkForNull(headerCosts?.NetBoughtOutPartCost)
            const bopTotalCost = bopCost * calculatePercentage(Percentage)
            
            setValue('OverheadBOPPercentage', checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice))
            setValue('OverheadBOPCost', checkForDecimalAndNull(bopCost, initialConfiguration?.NoOfDecimalForPrice))
            setValue('OverheadBOPTotalCost', checkForDecimalAndNull(bopTotalCost, initialConfiguration?.NoOfDecimalForPrice))
            break;

          case 'CC':
            const ccCost = getCCCost('overhead')
            const ccTotalCost = ccCost * calculatePercentage(Percentage)
            
            setValue('OverheadCCPercentage', checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice))
            setValue('OverheadCCCost', checkForDecimalAndNull(ccCost, initialConfiguration?.NoOfDecimalForPrice))
            setValue('OverheadCCTotalCost', checkForDecimalAndNull(ccTotalCost, initialConfiguration?.NoOfDecimalForPrice))
            break;

          default:
            break;
        }
      });

      // Update tempOverheadObj with all values
      const updatedTempObj = dataObj?.CostingApplicabilityDetails?.reduce((acc, detail) => {
        const { Applicability, Percentage } = detail;
        const baseCost = Applicability === 'RM' ? 
          (IsCutOffApplicable ? CutOffCost : headerCosts?.NetRawMaterialsCost) :
          Applicability === 'BOP' ? headerCosts?.NetBoughtOutPartCost :
          Applicability === 'CC' ? getCCCost('overhead') : 0;
        
        const totalCost = baseCost * calculatePercentage(Percentage);

        return {
          ...acc,
          [`Overhead${Applicability}Percentage`]: Percentage,
          [`Overhead${Applicability}Cost`]: baseCost,
          [`Overhead${Applicability}TotalCost`]: totalCost
        };
      }, {});

      setTempOverheadObj({
        ...tempOverheadObj,
        ...updatedTempObj
      });
    }
  }

  /**
  * @method setProfitValues
  * @description  SET PROFIT VALUES IN FIXED, COMBINED, RM, CC AND FIXED
  */
  const setProfitValues = (dataObj, IsAPIResponse) => {
    let totalToolCost = 0
    if (IsIncludedToolCost) {
      totalToolCost = checkForDecimalAndNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost, initialConfiguration?.NoOfDecimalForPrice)
    } else {
      totalToolCost = 0
    }

    if (!CostingViewMode) {

      let ProfitRMCost = 0
      let ProfitRMTotalCost = 0
      let ProfitBOPCost = 0
      let ProfitBOPTotalCost = 0
      let ProfitCCCost = 0
      let ProfitCCTotalCost = 0

      let ProfitRMPercentage = (dataObj?.IsProfitRMApplicable ? checkForNull(dataObj?.ProfitRMPercentage) : '')
      let ProfitBOPPercentage = (dataObj?.IsProfitBOPApplicable ? checkForNull(dataObj?.ProfitBOPPercentage) : '')
      let ProfitCCPercentage = (dataObj?.IsProfitCCApplicable ? checkForNull(dataObj?.ProfitCCPercentage) : '')

      let profitTotalCost = 0
      const IsCutOffApplicable = CostingDataList[0]?.IsRMCutOffApplicable;
      const RMBOPCC = headerCosts.NetRawMaterialsCost + headerCosts.NetBoughtOutPartCost + getCCCost("profit")
      const CutOffCost = checkForNull(CostingDataList && CostingDataList[0]?.RawMaterialCostWithCutOff)
      const CutOffRMBOPCCTotal = IsCutOffApplicable && headerCosts ? CutOffCost + headerCosts.NetBoughtOutPartCost + getCCCost("profit") : RMBOPCC; //NEED TO ASK HERE ALSO
      const CutOffRMC = CutOffCost;

      // IF BLOCK WILL GET EXECUTED WHEN TECHNOLOGY FOR COSTING IS ASSEMBLY FOR OTHER TECHNOLOGIES ELSE WILL EXECUTE
      if (partType) {
        ProfitRMCost = checkForNull(headerCosts?.NetRawMaterialsCost)
        ProfitCCCost = getCCCost('profit')
        ProfitBOPCost = checkForNull(headerCosts?.NetBoughtOutPartCost)
        ProfitRMTotalCost = ProfitRMCost * calculatePercentage(ProfitRMPercentage)
        ProfitCCTotalCost = ProfitCCCost * calculatePercentage(ProfitCCPercentage)
        ProfitBOPTotalCost = ProfitBOPCost * calculatePercentage(ProfitBOPPercentage)
      } else {
        ProfitRMCost = IsCutOffApplicable ? checkForNull(CutOffRMC) : checkForNull(headerCosts?.NetRawMaterialsCost)
        ProfitRMTotalCost = (IsCutOffApplicable ? checkForNull(CutOffRMC) : checkForNull(headerCosts?.NetRawMaterialsCost)) * calculatePercentage(checkForNull(ProfitRMPercentage))
        ProfitBOPCost = checkForNull(headerCosts && headerCosts?.NetBoughtOutPartCost)
        ProfitBOPTotalCost = checkForNull(ProfitBOPCost) * calculatePercentage(checkForNull(ProfitBOPPercentage))
        ProfitCCCost = getCCCost('profit')
        ProfitCCTotalCost = ProfitCCCost * calculatePercentage(ProfitCCPercentage)
      }

      if (dataObj?.IsProfitFixedApplicable && IsAPIResponse === false) {

        setValue('ProfitFixedPercentage', dataObj?.IsProfitFixedApplicable ? checkForDecimalAndNull(dataObj?.ProfitFixedPercentage, initialConfiguration?.NoOfDecimalForPrice) : '')
        setValue('ProfitFixedCost', '-')
        setValue('ProfitFixedTotalCost', dataObj?.IsProfitFixedApplicable ? checkForDecimalAndNull(dataObj?.ProfitFixedPercentage, initialConfiguration?.NoOfDecimalForPrice) : '')
        setProfitObj({
          ...profitObj,
          ProfitFixedPercentage: dataObj?.ProfitFixedPercentage,
          ProfitFixedCost: '-',
          ProfitFixedTotalCost: dataObj?.ProfitFixedPercentage,
        })
      }
      if (dataObj?.IsProfitCombined && IsAPIResponse === false) {

        const RMBOPCC = headerCosts?.NetBoughtOutPartCost + headerCosts?.NetRawMaterialsCost + getCCCost("profit")
        const CutOffRMBOPCCTotal = IsCutOffApplicable && headerCosts ? CutOffRMC + headerCosts?.NetBoughtOutPartCost + getCCCost("profit") : RMBOPCC;
        setValue('ProfitPercentage', dataObj?.IsProfitCombined ? checkForDecimalAndNull(dataObj?.ProfitPercentage, initialConfiguration?.NoOfDecimalForPrice) : '')
        setValue('ProfitCombinedCost', headerCosts && checkForDecimalAndNull(CutOffRMBOPCCTotal, initialConfiguration?.NoOfDecimalForPrice))
        setValue('ProfitCombinedTotalCost', checkForDecimalAndNull((CutOffRMBOPCCTotal * calculatePercentage(dataObj?.ProfitPercentage)), initialConfiguration?.NoOfDecimalForPrice))
        setProfitObj({
          ...profitObj,
          ProfitPercentage: dataObj?.ProfitPercentage,
          ProfitCombinedCost: headerCosts && checkForNull(CutOffRMBOPCCTotal),
          ProfitCombinedTotalCost: checkForNull(CutOffRMBOPCCTotal) * calculatePercentage(checkForNull(dataObj?.ProfitPercentage)),
        })
      }
      if (dataObj?.IsProfitRMApplicable && dataObj?.IsProfitBOPApplicable && dataObj?.IsProfitCCApplicable) {
        setValue('ProfitRMPercentage', checkForDecimalAndNull(ProfitRMPercentage, initialConfiguration?.NoOfDecimalForPrice))
        setValue('ProfitRMCost', checkForDecimalAndNull(ProfitRMCost, initialConfiguration?.NoOfDecimalForPrice))
        setValue('ProfitRMTotalCost', checkForDecimalAndNull(ProfitRMTotalCost, initialConfiguration?.NoOfDecimalForPrice))
        setValue('ProfitBOPPercentage', checkForDecimalAndNull(ProfitBOPPercentage, initialConfiguration?.NoOfDecimalForPrice))
        setValue('ProfitBOPCost', checkForDecimalAndNull(ProfitBOPCost, initialConfiguration?.NoOfDecimalForPrice))
        setValue('ProfitBOPTotalCost', checkForDecimalAndNull(ProfitBOPTotalCost, initialConfiguration?.NoOfDecimalForPrice))
        setValue('ProfitCCPercentage', checkForDecimalAndNull(ProfitCCPercentage, initialConfiguration?.NoOfDecimalForPrice))
        setValue('ProfitCCCost', checkForDecimalAndNull(ProfitCCCost, initialConfiguration?.NoOfDecimalForPrice))
        setValue('ProfitCCTotalCost', checkForDecimalAndNull(ProfitCCTotalCost, initialConfiguration?.NoOfDecimalForPrice))

        setTempProfitObj({
          ...tempProfitObj,
          ProfitRMPercentage: ProfitRMPercentage,
          ProfitRMCost: ProfitRMCost,
          ProfitRMTotalCost: ProfitRMTotalCost,
          ProfitBOPPercentage: ProfitBOPPercentage,
          ProfitBOPCost: ProfitBOPCost,
          ProfitBOPTotalCost: ProfitBOPTotalCost,
          ProfitCCPercentage: ProfitCCPercentage,
          ProfitCCCost: ProfitCCCost,
          ProfitCCTotalCost: ProfitCCTotalCost
        })
      }
      // SINGLE
      if (dataObj?.IsProfitRMApplicable && !dataObj?.IsProfitBOPApplicable && !dataObj?.IsProfitCCApplicable) {
        setValue('ProfitRMPercentage', checkForDecimalAndNull(ProfitRMPercentage, initialConfiguration?.NoOfDecimalForPrice))
        setValue('ProfitRMCost', checkForDecimalAndNull(ProfitRMCost, initialConfiguration?.NoOfDecimalForPrice))
        setValue('ProfitRMTotalCost', checkForDecimalAndNull(ProfitRMTotalCost, initialConfiguration?.NoOfDecimalForPrice))
        setTempProfitObj({
          ...tempProfitObj,
          ProfitRMPercentage: ProfitRMPercentage,
          ProfitRMCost: ProfitRMCost,
          ProfitRMTotalCost: ProfitRMTotalCost
        })
      }
      if (dataObj?.IsProfitBOPApplicable && !dataObj?.IsProfitRMApplicable && !dataObj?.IsProfitCCApplicable) {
        setValue('ProfitBOPPercentage', checkForDecimalAndNull(ProfitBOPPercentage, initialConfiguration?.NoOfDecimalForPrice))
        setValue('ProfitBOPCost', checkForDecimalAndNull(ProfitBOPCost, initialConfiguration?.NoOfDecimalForPrice))
        setValue('ProfitBOPTotalCost', checkForDecimalAndNull(ProfitBOPTotalCost, initialConfiguration?.NoOfDecimalForPrice))
        setTempProfitObj({
          ...tempProfitObj,
          ProfitBOPPercentage: ProfitBOPPercentage,
          ProfitBOPCost: ProfitBOPCost,
          ProfitBOPTotalCost: ProfitBOPTotalCost,
        })
      }
      if (dataObj?.IsProfitCCApplicable && !dataObj?.IsProfitBOPApplicable && !dataObj?.IsProfitRMApplicable) {
        setValue('ProfitCCPercentage', checkForDecimalAndNull(ProfitCCPercentage, initialConfiguration?.NoOfDecimalForPrice))
        setValue('ProfitCCCost', checkForDecimalAndNull(ProfitCCCost, initialConfiguration?.NoOfDecimalForPrice))
        setValue('ProfitCCTotalCost', checkForDecimalAndNull(ProfitCCTotalCost, initialConfiguration?.NoOfDecimalForPrice))
        setTempProfitObj({
          ...tempProfitObj,
          ProfitCCPercentage: ProfitCCPercentage,
          ProfitCCCost: ProfitCCCost,
          ProfitCCTotalCost: ProfitCCTotalCost
        })
      }
      if (dataObj?.IsProfitRMApplicable && dataObj?.IsProfitCCApplicable && !dataObj?.IsProfitBOPApplicable) {
        setValue('ProfitRMPercentage', checkForDecimalAndNull(ProfitRMPercentage, initialConfiguration?.NoOfDecimalForPrice))
        setValue('ProfitRMCost', checkForDecimalAndNull(ProfitRMCost, initialConfiguration?.NoOfDecimalForPrice))
        setValue('ProfitRMTotalCost', checkForDecimalAndNull(ProfitRMTotalCost, initialConfiguration?.NoOfDecimalForPrice))
        setValue('ProfitCCPercentage', checkForDecimalAndNull(ProfitCCPercentage, initialConfiguration?.NoOfDecimalForPrice))
        setValue('ProfitCCCost', checkForDecimalAndNull(ProfitCCCost, initialConfiguration?.NoOfDecimalForPrice))
        setValue('ProfitCCTotalCost', checkForDecimalAndNull(ProfitCCTotalCost, initialConfiguration?.NoOfDecimalForPrice))

        setTempProfitObj({
          ...tempProfitObj,
          ProfitRMPercentage: ProfitRMPercentage,
          ProfitRMCost: ProfitRMCost,
          ProfitRMTotalCost: ProfitRMTotalCost,
          ProfitCCPercentage: ProfitCCPercentage,
          ProfitCCCost: ProfitCCCost,
          ProfitCCTotalCost: ProfitCCTotalCost
        })
      }
      if (dataObj?.IsProfitRMApplicable && dataObj?.IsProfitBOPApplicable && !dataObj?.IsProfitCCApplicable) {
        setValue('ProfitRMPercentage', checkForDecimalAndNull(ProfitRMPercentage, initialConfiguration?.NoOfDecimalForPrice))
        setValue('ProfitRMCost', checkForDecimalAndNull(ProfitRMCost, initialConfiguration?.NoOfDecimalForPrice))
        setValue('ProfitRMTotalCost', checkForDecimalAndNull(ProfitRMTotalCost, initialConfiguration?.NoOfDecimalForPrice))
        setValue('ProfitBOPPercentage', checkForDecimalAndNull(ProfitBOPPercentage, initialConfiguration?.NoOfDecimalForPrice))
        setValue('ProfitBOPCost', checkForDecimalAndNull(ProfitBOPCost, initialConfiguration?.NoOfDecimalForPrice))
        setValue('ProfitBOPTotalCost', checkForDecimalAndNull(ProfitBOPTotalCost, initialConfiguration?.NoOfDecimalForPrice))

        setTempProfitObj({
          ...tempProfitObj,
          ProfitRMPercentage: ProfitRMPercentage,
          ProfitRMCost: ProfitRMCost,
          ProfitRMTotalCost: ProfitRMTotalCost,
          ProfitBOPPercentage: ProfitBOPPercentage,
          ProfitBOPCost: ProfitBOPCost,
          ProfitBOPTotalCost: ProfitBOPTotalCost,
        })
      }
      if (dataObj?.IsProfitBOPApplicable && dataObj?.IsProfitCCApplicable && !dataObj?.IsProfitRMApplicable) {
        setValue('ProfitBOPPercentage', checkForDecimalAndNull(ProfitBOPPercentage, initialConfiguration?.NoOfDecimalForPrice))
        setValue('ProfitBOPCost', checkForDecimalAndNull(ProfitBOPCost, initialConfiguration?.NoOfDecimalForPrice))
        setValue('ProfitBOPTotalCost', checkForDecimalAndNull(ProfitBOPTotalCost, initialConfiguration?.NoOfDecimalForPrice))
        setValue('ProfitCCPercentage', checkForDecimalAndNull(ProfitCCPercentage, initialConfiguration?.NoOfDecimalForPrice))
        setValue('ProfitCCCost', checkForDecimalAndNull(ProfitCCCost, initialConfiguration?.NoOfDecimalForPrice))
        setValue('ProfitCCTotalCost', checkForDecimalAndNull(ProfitCCTotalCost, initialConfiguration?.NoOfDecimalForPrice))

        setTempProfitObj({
          ...tempProfitObj,
          ProfitBOPPercentage: ProfitBOPPercentage,
          ProfitBOPCost: ProfitBOPCost,
          ProfitBOPTotalCost: ProfitBOPTotalCost,
          ProfitCCPercentage: ProfitCCPercentage,
          ProfitCCCost: ProfitCCCost,
          ProfitCCTotalCost: ProfitCCTotalCost
        })
      }
    }

  }
  /**
  * @method getCCCost
  * @description Get CC cost based on type (overhead/profit)
  */
  const getCCCost = (type = '') => {
    if (type === 'overhead') {
      return checkForNull(headerCosts?.NetProcessCostForOverhead) + checkForNull(headerCosts?.NetOperationCostForOverhead) +  checkForNull(totalToolCost);
    } else if (type === 'profit') {
      return checkForNull(headerCosts?.NetProcessCostForProfit) +checkForNull(headerCosts?.NetOperationCostForProfit) +checkForNull(totalToolCost) ;
    }
  }
  /**
  * @method IncludeSurfaceTreatmentCall
  * @description INCLUDE SURFACE TREATMENT IN TO OVERHEAD AND PROFIT
  */

  const IncludeSurfaceTreatmentCall = () => {

    let totalToolCost = 0
    if (IsIncludedToolCost) {
      totalToolCost = checkForDecimalAndNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost, initialConfiguration?.NoOfDecimalForPrice)
    } else {
      totalToolCost = 0
    }

    setShowRefreshWarningMessage(false)
    if (!CostingViewMode) {
      // Check if model type is empty, if so clear all overhead and profit data
      if (!modelType || modelType?.length === 0 || !modelType?.value) {
        setOverheadObj({})
        setProfitObj({})
        setOverheadValues({}, true)
        setProfitValues({}, true)
        setIsSurfaceTreatmentAdded(false)
        return;
      }

      let RM_CC_BOP_Overhead = 0
      let RM_CC_Overhead = 0
      let BOP_CC_Overhead = 0
      let RM_CC_BOP_Profit = 0
      let RM_CC_Profit = 0
      let BOP_CC_Profit = 0
      let RM_BOP = 0
      let CC_Overhead = 0
      let CC_Profit = 0

      let overheadTotalCost = 0
      let overheadCombinedCost = 0
      let profitTotalCost = 0
      let profitCombinedCost = 0

      const NetSurfaceTreatmentCost = SurfaceTreatmentCost && SurfaceTreatmentCost?.NetSurfaceTreatmentCost !== undefined ? checkForNull(SurfaceTreatmentCost?.NetSurfaceTreatmentCost) : checkForNull(CostingDataList[0]?.NetSurfaceTreatmentCost);
      let OverheadCCPercentage = overheadObj?.OverheadCCPercentage
      let OverheadPercentage = overheadObj?.OverheadPercentage
      let OverheadApplicability = overheadObj?.OverheadApplicability

      let ProfitCCPercentage = profitObj?.ProfitCCPercentage
      let ProfitPercentage = profitObj?.ProfitPercentage
      let ProfitApplicability = profitObj?.ProfitApplicability

      dispatch(isOverheadProfitDataChange(true))

      // IF BLOCK WILL GET EXECUTED WHEN TECHNOLOGY FOR COSTING IS ASSEMBLY FOR OTHER TECHNOLOGIES ELSE WILL EXECUTE
      if (partType) {

        let ccOverheadCost = checkForNull(getCCCost('overhead'))
        let ccProfitCost = checkForNull(getCCCost('profit'))
        const BOPTotalCost = checkForNull(headerCosts?.NetBoughtOutPartCost)
        const PartCost = checkForNull(headerCosts?.NetRawMaterialsCost)

        CC_Overhead = ccOverheadCost + totalToolCost
        CC_Profit = ccProfitCost + totalToolCost
        RM_CC_BOP_Overhead = checkForNull(PartCost) + checkForNull(ccOverheadCost) + checkForNull(BOPTotalCost) + totalToolCost
        RM_CC_Overhead = checkForNull(PartCost) + checkForNull(ccOverheadCost) + totalToolCost
        BOP_CC_Overhead = checkForNull(ccOverheadCost) + checkForNull(BOPTotalCost) + totalToolCost
        RM_CC_BOP_Profit = checkForNull(PartCost) + checkForNull(ccProfitCost) + checkForNull(BOPTotalCost) + totalToolCost
        RM_CC_Profit = checkForNull(PartCost) + checkForNull(ccProfitCost) + totalToolCost
        BOP_CC_Profit = checkForNull(ccProfitCost) + checkForNull(BOPTotalCost) + totalToolCost
        RM_BOP = checkForNull(PartCost) + checkForNull(BOPTotalCost)
      } else {

        const IsCutOffApplicable = CostingDataList[0]?.IsRMCutOffApplicable;
        const CutOffCost = checkForNull(CostingDataList && CostingDataList[0]?.RawMaterialCostWithCutOff)
        const CutOffRMC = CutOffCost;
        const ConversionCostForOverheadCalculation = /* costData?.IsAssemblyPart ? (checkForNull(headerCosts?.NetConversionCost) - checkForNull(headerCosts?.TotalOtherOperationCostPerAssembly)) */  getCCCost('overhead')
        const ConversionCostForProfitCalculation = /* costData?.IsAssemblyPart ? (checkForNull(headerCosts?.NetConversionCost) - checkForNull(headerCosts?.TotalOtherOperationCostPerAssembly)) : */ getCCCost('profit')
        const RMBOPCC_Overhead = headerCosts?.NetRawMaterialsCost + headerCosts?.NetBoughtOutPartCost + ConversionCostForOverheadCalculation
        const RMBOPCC_Profit = headerCosts?.NetRawMaterialsCost + headerCosts?.NetBoughtOutPartCost + ConversionCostForProfitCalculation
        RM_CC_BOP_Overhead = (IsCutOffApplicable && headerCosts) ? (CutOffCost + headerCosts.NetBoughtOutPartCost + ConversionCostForOverheadCalculation) + totalToolCost : RMBOPCC_Overhead + totalToolCost;

        RM_CC_Overhead = (IsCutOffApplicable ? CutOffRMC : headerCosts?.NetRawMaterialsCost) + ConversionCostForOverheadCalculation + totalToolCost;
        BOP_CC_Overhead = headerCosts?.NetBoughtOutPartCost + ConversionCostForOverheadCalculation + totalToolCost;
        RM_CC_BOP_Profit = (IsCutOffApplicable && headerCosts) ? (CutOffCost + headerCosts.NetBoughtOutPartCost + ConversionCostForProfitCalculation) + totalToolCost : RMBOPCC_Profit + totalToolCost;
        RM_CC_Profit = (IsCutOffApplicable ? CutOffRMC : headerCosts?.NetRawMaterialsCost) + ConversionCostForProfitCalculation + totalToolCost;
        BOP_CC_Profit = headerCosts?.NetBoughtOutPartCost + ConversionCostForProfitCalculation + totalToolCost;
        RM_BOP = (IsCutOffApplicable ? CutOffRMC : headerCosts?.NetRawMaterialsCost) + headerCosts?.NetBoughtOutPartCost;
        CC_Overhead = ConversionCostForOverheadCalculation + totalToolCost;
        CC_Profit = ConversionCostForProfitCalculation + totalToolCost;

      }

      setOverheadValues(overheadObj, false)
      setProfitValues(profitObj, false)

      // START HERE ADD CC IN OVERHEAD
      if (IsIncludedSurfaceInOverheadProfit && IsSurfaceTreatmentAdded === false && overheadObj && overheadObj?.IsOverheadCCApplicable) {

        const overheadCCCost = checkForNull(CC_Overhead) + checkForNull(NetSurfaceTreatmentCost)
        const totalOverheadCost = checkForNull(overheadCCCost) * calculatePercentage(checkForNull(OverheadCCPercentage))

        setValue('OverheadCCCost', checkForDecimalAndNull(overheadCCCost, initialConfiguration?.NoOfDecimalForPrice))
        setValue('OverheadCCTotalCost', checkForDecimalAndNull(totalOverheadCost, initialConfiguration?.NoOfDecimalForPrice))

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
      } else if (!IsIncludedSurfaceInOverheadProfit && overheadObj && overheadObj?.IsOverheadCCApplicable) {
        const overheadCCCost = checkForNull(CC_Overhead)
        const OverheadCCTotalCost = checkForNull(overheadCCCost) * calculatePercentage(checkForNull(OverheadCCPercentage))

        setValue('OverheadCCCost', checkForDecimalAndNull(overheadCCCost, initialConfiguration?.NoOfDecimalForPrice))
        setValue('OverheadCCTotalCost', checkForDecimalAndNull(OverheadCCTotalCost, initialConfiguration?.NoOfDecimalForPrice))
        setIsSurfaceTreatmentAdded(false)
        setOverheadObj({
          ...overheadObj,
          OverheadCCPercentage: OverheadCCPercentage,
          OverheadCCCost: overheadCCCost,
          OverheadCCTotalCost: OverheadCCTotalCost
        })
        setTempOverheadObj({
          ...tempOverheadObj,
          OverheadCCPercentage: OverheadCCPercentage,
          OverheadCCCost: overheadCCCost,
          OverheadCCTotalCost: OverheadCCTotalCost
        })

        // END HERE ADD CC IN OVERHEAD
      }
      // START ADD CC IN PROFIT
      if (IsIncludedSurfaceInOverheadProfit && IsSurfaceTreatmentAdded === false && profitObj && profitObj?.IsProfitCCApplicable) {

        const profitCCCost = checkForNull(CC_Profit) + checkForNull(NetSurfaceTreatmentCost)
        const profitTotalCost = checkForNull(profitCCCost) * calculatePercentage(checkForNull(ProfitCCPercentage))
        setValue('ProfitCCCost', checkForDecimalAndNull(profitCCCost, initialConfiguration?.NoOfDecimalForPrice))
        setValue('ProfitCCTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration?.NoOfDecimalForPrice))
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
      } else if (!IsIncludedSurfaceInOverheadProfit && profitObj && profitObj?.IsProfitCCApplicable) {

        const profitCCCost = checkForNull(CC_Profit)
        const profitTotalCost = checkForNull(profitCCCost) * calculatePercentage(checkForNull(ProfitCCPercentage))
        setValue('ProfitCCCost', checkForDecimalAndNull(profitCCCost, initialConfiguration?.NoOfDecimalForPrice))
        setValue('ProfitCCTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration?.NoOfDecimalForPrice))
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
      if (IsIncludedSurfaceInOverheadProfit && IsSurfaceTreatmentAdded === false && overheadObj && overheadObj?.IsOverheadCombined) {

        switch (OverheadApplicability) {
          case 'RM + CC + BOP':
          case 'Part Cost + CC + BOP':

            if ((partType && OverheadApplicability === 'Part Cost + CC + BOP') || (!partType && OverheadApplicability === 'RM + CC + BOP')) {

              overheadCombinedCost = checkForNull(RM_CC_BOP_Overhead) + checkForNull(NetSurfaceTreatmentCost)
              overheadTotalCost = checkForNull(overheadCombinedCost) * calculatePercentage(checkForNull(OverheadPercentage))

              setValue('OverheadPercentage', checkForDecimalAndNull(OverheadPercentage, initialConfiguration?.NoOfDecimalForPrice))
              setValue('OverheadCombinedCost', checkForDecimalAndNull(overheadCombinedCost, initialConfiguration?.NoOfDecimalForPrice))
              setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(overheadTotalCost, initialConfiguration?.NoOfDecimalForPrice))
              setOverheadObj({
                ...overheadObj,
                OverheadCombinedCost: overheadCombinedCost,
                OverheadCombinedTotalCost: overheadTotalCost,
              })
            }
            break;

          case 'RM + CC':
          case 'Part Cost + CC':

            if ((partType && OverheadApplicability === 'Part Cost + CC') || (!partType && OverheadApplicability === 'RM + CC')) {
              overheadCombinedCost = checkForNull(RM_CC_Overhead) + checkForNull(NetSurfaceTreatmentCost)
              overheadTotalCost = checkForNull(overheadCombinedCost) * calculatePercentage(checkForNull(OverheadPercentage))
              setValue('OverheadPercentage', checkForDecimalAndNull(OverheadPercentage, initialConfiguration?.NoOfDecimalForPrice))
              setValue('OverheadCombinedCost', checkForDecimalAndNull(overheadCombinedCost, initialConfiguration?.NoOfDecimalForPrice))
              setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(overheadTotalCost, initialConfiguration?.NoOfDecimalForPrice))
              setOverheadObj({
                ...overheadObj,
                OverheadCombinedCost: overheadCombinedCost,
                OverheadCombinedTotalCost: overheadTotalCost,
              })
            }
            break;

          case 'BOP + CC':

            overheadCombinedCost = checkForNull(BOP_CC_Overhead) + checkForNull(NetSurfaceTreatmentCost)
            overheadTotalCost = checkForNull(overheadCombinedCost) * calculatePercentage(checkForNull(OverheadPercentage))

            setValue('OverheadPercentage', checkForDecimalAndNull(OverheadPercentage, initialConfiguration?.NoOfDecimalForPrice))
            setValue('OverheadCombinedCost', checkForDecimalAndNull(overheadCombinedCost, initialConfiguration?.NoOfDecimalForPrice))
            setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(overheadTotalCost, initialConfiguration?.NoOfDecimalForPrice))
            setOverheadObj({
              ...overheadObj,
              OverheadCombinedCost: overheadCombinedCost,
              OverheadCombinedTotalCost: overheadTotalCost,
            })
            break;

          case 'RM + BOP':
          case 'Part Cost + BOP':

            if ((partType && OverheadApplicability === 'Part Cost + BOP') || (!partType && OverheadApplicability === 'RM + BOP')) {
              overheadCombinedCost = checkForNull(RM_BOP)
              overheadTotalCost = checkForNull(overheadCombinedCost) * calculatePercentage(checkForNull(OverheadPercentage))

              setValue('OverheadPercentage', checkForDecimalAndNull(OverheadPercentage, initialConfiguration?.NoOfDecimalForPrice))
              setValue('OverheadCombinedCost', checkForDecimalAndNull(overheadCombinedCost, initialConfiguration?.NoOfDecimalForPrice))
              setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(overheadTotalCost, initialConfiguration?.NoOfDecimalForPrice))
              setOverheadObj({
                ...overheadObj,
                OverheadCombinedCost: overheadCombinedCost,
                OverheadCombinedTotalCost: overheadTotalCost,
              })
            }
            break;

          default:
            break;
        }

      } else if (!IsIncludedSurfaceInOverheadProfit && overheadObj && overheadObj?.IsOverheadCombined) {
        const { OverheadApplicability, OverheadPercentage } = overheadObj;
        let overheadTotalCost = 0
        let overheadCombinedCost = 0
        switch (OverheadApplicability) {
          case 'RM + CC + BOP':
          case 'Part Cost + CC + BOP':

            if ((partType && OverheadApplicability === 'Part Cost + CC + BOP') || (!partType && OverheadApplicability === 'RM + CC + BOP')) {
              overheadCombinedCost = checkForNull(RM_CC_BOP_Overhead)
              overheadTotalCost = checkForNull(overheadCombinedCost) * calculatePercentage(checkForNull(OverheadPercentage))
              setValue('OverheadPercentage', checkForDecimalAndNull(OverheadPercentage, initialConfiguration?.NoOfDecimalForPrice))
              setValue('OverheadCombinedCost', checkForDecimalAndNull(overheadCombinedCost, initialConfiguration?.NoOfDecimalForPrice))
              setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(overheadTotalCost, initialConfiguration?.NoOfDecimalForPrice))
              setIsSurfaceTreatmentAdded(false)
              setOverheadObj({
                ...overheadObj,
                OverheadCombinedCost: overheadCombinedCost,
                OverheadCombinedTotalCost: overheadTotalCost
              })
            }
            break;

          case 'RM + CC':
          case 'Part Cost + CC':

            if ((partType && OverheadApplicability === 'Part Cost + CC') || (!partType && OverheadApplicability === 'RM + CC')) {
              overheadCombinedCost = checkForNull(RM_CC_Overhead)
              overheadTotalCost = checkForNull(overheadCombinedCost) * calculatePercentage(checkForNull(OverheadPercentage))

              setValue('OverheadPercentage', checkForDecimalAndNull(OverheadPercentage, initialConfiguration?.NoOfDecimalForPrice))
              setValue('OverheadCombinedCost', checkForDecimalAndNull(overheadCombinedCost, initialConfiguration?.NoOfDecimalForPrice))
              setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(overheadTotalCost, initialConfiguration?.NoOfDecimalForPrice))
              setIsSurfaceTreatmentAdded(false)
              setOverheadObj({
                ...overheadObj,
                OverheadCombinedCost: overheadCombinedCost,
                OverheadCombinedTotalCost: overheadTotalCost,
              })
            }
            break;

          case 'BOP + CC':

            overheadCombinedCost = checkForNull(BOP_CC_Overhead)
            overheadTotalCost = checkForNull(overheadCombinedCost) * calculatePercentage(checkForNull(OverheadPercentage))

            setValue('OverheadPercentage', checkForDecimalAndNull(OverheadPercentage, initialConfiguration?.NoOfDecimalForPrice))
            setValue('OverheadCombinedCost', checkForDecimalAndNull(overheadCombinedCost, initialConfiguration?.NoOfDecimalForPrice))
            setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(overheadTotalCost, initialConfiguration?.NoOfDecimalForPrice))
            setIsSurfaceTreatmentAdded(false)
            setOverheadObj({
              ...overheadObj,
              OverheadCombinedCost: overheadCombinedCost,
              OverheadCombinedTotalCost: overheadTotalCost,
            })
            break;

          case 'RM + BOP':
          case 'Part Cost + BOP':

            if ((partType && OverheadApplicability === 'Part Cost + BOP') || (!partType && OverheadApplicability === 'RM + BOP')) {
              overheadCombinedCost = checkForNull(RM_BOP)
              overheadTotalCost = checkForNull(overheadCombinedCost) * calculatePercentage(checkForNull(OverheadPercentage))
              setValue('OverheadPercentage', checkForDecimalAndNull(OverheadPercentage, initialConfiguration?.NoOfDecimalForPrice))
              setValue('OverheadCombinedCost', checkForDecimalAndNull(overheadCombinedCost, initialConfiguration?.NoOfDecimalForPrice))
              setValue('OverheadCombinedTotalCost', checkForDecimalAndNull(overheadTotalCost, initialConfiguration?.NoOfDecimalForPrice))
              setOverheadObj({
                ...overheadObj,
                OverheadCombinedCost: overheadCombinedCost,
                OverheadCombinedTotalCost: overheadTotalCost,
              })
            }
            break;

          default:
            break;
        }
        // END HERE ADD CC IN OVERHEAD COMBINED
      }
      // ----
      // START ADD CC IN PROFIT COMBINED
      if (IsIncludedSurfaceInOverheadProfit && IsSurfaceTreatmentAdded === false && profitObj && profitObj?.IsProfitCombined) {

        switch (ProfitApplicability) {
          case 'RM + CC + BOP':
          case 'Part Cost + CC + BOP':

            if ((partType && ProfitApplicability === 'Part Cost + CC + BOP') || (!partType && ProfitApplicability === 'RM + CC + BOP')) {
              profitCombinedCost = checkForNull(RM_CC_BOP_Profit) + checkForNull(NetSurfaceTreatmentCost)
              profitTotalCost = checkForNull(profitCombinedCost) * calculatePercentage(checkForNull(ProfitPercentage))

              setValue('ProfitPercentage', checkForDecimalAndNull(ProfitPercentage, initialConfiguration?.NoOfDecimalForPrice))
              setValue('ProfitCombinedCost', checkForDecimalAndNull(profitCombinedCost, initialConfiguration?.NoOfDecimalForPrice))
              setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration?.NoOfDecimalForPrice))
              setProfitObj({
                ...profitObj,
                ProfitCombinedCost: profitCombinedCost,
                ProfitCombinedTotalCost: profitTotalCost,
              })
            }
            break;

          case 'RM + CC':
          case 'Part Cost + CC':

            if ((partType && ProfitApplicability === 'Part Cost + CC') || (!partType && ProfitApplicability === 'RM + CC')) {
              profitCombinedCost = checkForNull(RM_CC_Profit) + checkForNull(NetSurfaceTreatmentCost)
              profitTotalCost = checkForNull(profitCombinedCost) * calculatePercentage(checkForNull(ProfitPercentage))
              setValue('ProfitPercentage', checkForDecimalAndNull(ProfitPercentage, initialConfiguration?.NoOfDecimalForPrice))
              setValue('ProfitCombinedCost', checkForDecimalAndNull(profitCombinedCost, initialConfiguration?.NoOfDecimalForPrice))
              setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration?.NoOfDecimalForPrice))
              setProfitObj({
                ...profitObj,
                ProfitCombinedCost: profitCombinedCost,
                ProfitCombinedTotalCost: profitTotalCost,
              })
            }
            break;

          case 'BOP + CC':

            profitCombinedCost = checkForNull(BOP_CC_Profit) + checkForNull(NetSurfaceTreatmentCost)
            profitTotalCost = checkForNull(profitCombinedCost) * calculatePercentage(checkForNull(ProfitPercentage))

            setValue('ProfitPercentage', checkForDecimalAndNull(ProfitPercentage, initialConfiguration?.NoOfDecimalForPrice))
            setValue('ProfitCombinedCost', checkForDecimalAndNull(profitCombinedCost, initialConfiguration?.NoOfDecimalForPrice))
            setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration?.NoOfDecimalForPrice))
            setProfitObj({
              ...profitObj,
              ProfitCombinedCost: profitCombinedCost,
              ProfitCombinedTotalCost: profitTotalCost,
            })
            break;

          case 'RM + BOP':
          case 'Part Cost + BOP':

            if ((partType && ProfitApplicability === 'Part Cost + BOP') || (!partType && ProfitApplicability === 'RM + BOP')) {
              profitCombinedCost = checkForNull(RM_BOP)
              profitTotalCost = checkForNull(profitCombinedCost) * calculatePercentage(checkForNull(ProfitPercentage))

              setValue('ProfitPercentage', checkForDecimalAndNull(ProfitPercentage, initialConfiguration?.NoOfDecimalForPrice))
              setValue('ProfitCombinedCost', checkForDecimalAndNull(profitCombinedCost, initialConfiguration?.NoOfDecimalForPrice))
              setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration?.NoOfDecimalForPrice))
              setProfitObj({
                ...profitObj,
                ProfitCombinedCost: profitCombinedCost,
                ProfitCombinedTotalCost: profitTotalCost,
              })
            }
            break;
          default:
            break;
        }

      } else if (!IsIncludedSurfaceInOverheadProfit && profitObj && profitObj?.IsProfitCombined) {

        switch (ProfitApplicability) {
          case 'RM + CC + BOP':
          case 'Part Cost + CC + BOP':

            if ((partType && ProfitApplicability === 'Part Cost + CC + BOP') || (!partType && ProfitApplicability === 'RM + CC + BOP')) {
              profitCombinedCost = checkForNull(RM_CC_BOP_Profit)
              profitTotalCost = checkForNull(profitCombinedCost) * calculatePercentage(checkForNull(ProfitPercentage))
              setValue('ProfitPercentage', checkForDecimalAndNull(ProfitPercentage, initialConfiguration?.NoOfDecimalForPrice))
              setValue('ProfitCombinedCost', checkForDecimalAndNull(profitCombinedCost, initialConfiguration?.NoOfDecimalForPrice))
              setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration?.NoOfDecimalForPrice))
              setIsSurfaceTreatmentAdded(false)
              setProfitObj({
                ...profitObj,
                ProfitCombinedCost: profitCombinedCost,
                ProfitCombinedTotalCost: profitTotalCost
              })
            }
            break;

          case 'RM + CC':
          case 'Part Cost + CC':

            if ((partType && ProfitApplicability === 'Part Cost + CC') || (!partType && ProfitApplicability === 'RM + CC')) {
              profitCombinedCost = checkForNull(RM_CC_Profit)
              profitTotalCost = checkForNull(profitCombinedCost) * calculatePercentage(checkForNull(ProfitPercentage))

              setValue('ProfitPercentage', checkForDecimalAndNull(ProfitPercentage, initialConfiguration?.NoOfDecimalForPrice))
              setValue('ProfitCombinedCost', checkForDecimalAndNull(profitCombinedCost, initialConfiguration?.NoOfDecimalForPrice))
              setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration?.NoOfDecimalForPrice))
              setIsSurfaceTreatmentAdded(false)
              setProfitObj({
                ...profitObj,
                ProfitCombinedCost: profitCombinedCost,
                ProfitCombinedTotalCost: profitTotalCost,
              })
            }
            break;

          case 'BOP + CC':

            profitCombinedCost = checkForNull(BOP_CC_Profit)
            profitTotalCost = checkForNull(profitCombinedCost) * calculatePercentage(checkForNull(ProfitPercentage))

            setValue('ProfitPercentage', checkForDecimalAndNull(ProfitPercentage, initialConfiguration?.NoOfDecimalForPrice))
            setValue('ProfitCombinedCost', checkForDecimalAndNull(profitCombinedCost, initialConfiguration?.NoOfDecimalForPrice))
            setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration?.NoOfDecimalForPrice))
            setIsSurfaceTreatmentAdded(false)
            setProfitObj({
              ...profitObj,
              ProfitCombinedCost: profitCombinedCost,
              ProfitCombinedTotalCost: profitTotalCost,
            })
            break;

          case 'RM + BOP':
          case 'Part Cost + BOP':

            if ((partType && ProfitApplicability === 'Part Cost + BOP') || (!partType && ProfitApplicability === 'RM + BOP')) {
              profitCombinedCost = checkForNull(RM_BOP)
              profitTotalCost = checkForNull(profitCombinedCost) * calculatePercentage(checkForNull(ProfitPercentage))
              setValue('ProfitPercentage', checkForDecimalAndNull(ProfitPercentage, initialConfiguration?.NoOfDecimalForPrice))
              setValue('ProfitCombinedCost', checkForDecimalAndNull(profitCombinedCost, initialConfiguration?.NoOfDecimalForPrice))
              setValue('ProfitCombinedTotalCost', checkForDecimalAndNull(profitTotalCost, initialConfiguration?.NoOfDecimalForPrice))
              setProfitObj({
                ...profitObj,
                ProfitCombinedCost: profitCombinedCost,
                ProfitCombinedTotalCost: profitTotalCost,
              })
            }
            break;

          default:
            break;
        }
        // END HERE ADD CC IN PROFIT COMBINED
      }

    }
  }

  const resetData = () => {
    setValue('ModelType', '')
    setOverheadObj({})
    setProfitObj({})
  }
  useEffect(() => {

    if (Object.keys(errors).length > 0 && counter < 2) {
      counter = counter + 1;
      dispatch(setOverheadProfitErrors(errors))
    } else if (Object.keys(errors).length === 0 && counter > 0) {
      counter = 0
      dispatch(setOverheadProfitErrors({}))
    }
  })

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
    // console.log(data,'data')
    let value = checkForDecimalAndNull(checkForNull(data?.CostingPartDetails?.OverheadCost) + checkForNull(data?.CostingPartDetails?.ProfitCost), initialConfiguration?.NoOfDecimalForPrice);
    return value === 0 ? '' : value;
  }

  const onCRMHeadChangeOverhead = (e) => {
    if (e) {
      setOverheadObj({
        ...overheadObj,
        OverheadCRMHead: e?.label
      })
    }
  }

  const onCRMHeadChangeProfit = (e) => {
    if (e) {
      setProfitObj({
        ...profitObj,
        ProfitCRMHead: e?.label
      })
    }
  }

  const onRemarkPopUpClickOverHead = () => {

    if (errors.overHeadRemark !== undefined) {
      return false
    }

    setOverheadObj({
      ...overheadObj,
      Remark: getValues('overHeadRemark')
    })

    if (getValues(`overHeadRemark`)) {
      Toaster.success('Remark saved successfully')
    }
    var button = document.getElementById(`popUpTriggerOverHead`)
    button.click()
  }


  const onRemarkPopUpCloseOverHead = () => {
    let button = document.getElementById(`popUpTriggerOverHead`)
    setValue(`overHeadRemark`, overheadObj.Remark)
    if (errors.overHeadRemark) {
      delete errors.overHeadRemark;
    }
    button.click()
  }

  const onRemarkPopUpClickProfit = () => {

    if (errors.profitRemark !== undefined) {
      return false
    }

    setProfitObj({
      ...profitObj,
      Remark: getValues('profitRemark')
    })

    if (getValues(`profitRemark`)) {
      Toaster.success('Remark saved successfully')
    }
    var button = document.getElementById(`popUpTriggerProfit`)
    button.click()
  }

  const onRemarkPopUpCloseProfit = () => {
    let button = document.getElementById(`popUpTriggerProfit`)
    setValue(`profitRemark`, profitObj.Remark)
    if (errors.profitRemark) {
      delete errors.profitRemark;
    }
    button.click()
  }
  const renderText = (type, RMValue) => {
    let text = '';
    switch (type) {
      case 'OverheadCombinedCost':
        let checkValid = (overheadObj && overheadObj?.OverheadApplicability.includes('RM') && CostingDataList[0]?.IsRMCutOffApplicable === true)
        text = checkValid ? `RM cut-off price ${RMValue} applied` : ''
        break;
      default:
        break;
    }

    let temp = <div>{<p>{text}</p>}{showWarning && <p>BOP cost is not included for BOP part type</p>}</div>
    return temp;
  }

  const handleCostChange = (e, item, type) => {
    const value = e.target.value;
    // Update the cost in the appropriate state
    if (type === 'Overhead') {
      setOverheadObj(prev => ({
        ...prev,
        CostingApplicabilityDetails: prev.CostingApplicabilityDetails.map(detail => 
          detail.ApplicabilityDetailsId === item.ApplicabilityDetailsId 
            ? { ...detail, Cost: value }
            : detail
        )
      }));
    } else {
      setProfitObj(prev => ({
        ...prev,
        CostingApplicabilityDetails: prev.CostingApplicabilityDetails.map(detail => 
          detail.ApplicabilityDetailsId === item.ApplicabilityDetailsId 
            ? { ...detail, Cost: value }
            : detail
        )
      }));
    }
  };

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
                  isClearable={true}
                />
                {showRefreshWarningMessage && <WarningMessage message={'Press refresh button to get updated values'} />}
              </Col>

              <Col md="3" className='pl-0'>
                <label>
                  {''}
                </label>
                <button type="button" id="overhead-refresh" className={'refresh-icon mt12'} onClick={() => IncludeSurfaceTreatmentCall()}>
                  <TooltipCustom disabledIcon={true} id="overhead-refresh" tooltipText="Refresh to update Overhead and Profit cost" />
                </button>
              </Col>

              <Col md="3">
                {''}
              </Col>

              <Col md="3" className="pl-0">
                <label>
                  {'Net Overhead & Profit'}
                </label>
                <input id="net_overhead_profit_input" placeholder='-' className="form-control" disabled value={showValueInInput()} />
              </Col>

              <Col md="12" className="">
                <div className="left-border">
                  {`Overheads ${overheadObj && overheadObj.OverheadApplicability ? '(' + overheadObj.OverheadApplicability + ')' : '-'}`}
                </div>
              </Col>

              {initialConfiguration?.IsShowCRMHead && <Col md="3">
                <SearchableSelectHookForm
                  name={`crmHeadOverhead`}
                  type="text"
                  label="CRM Head"
                  errors={errors.crmHeadOverhead}
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
                  handleChange={onCRMHeadChangeOverhead}
                  disabled={CostingViewMode}
                />
              </Col>}


              <Col md={overheadObj?.OverheadApplicability ? "11" : "12"} className='first-section'>
                <OverheadProfitTable
                  data={overheadObj}
                  type="Overhead"
                  Controller={Controller}
                  control={control}
                  register={register}
                  setValue={setValue}
                  getValues={getValues}
                  errors={errors}
                  CostingViewMode={CostingViewMode}
                  initialConfiguration={initialConfiguration}
                  onCostChange={(e, item) => handleCostChange(e, item, 'Overhead')}
                  isFixedApplicable={overheadObj?.CostingApplicabilityDetails?.some(detail => detail.Applicability === 'Fixed')}
                />
              </Col>

              {
                overheadObj && overheadObj.OverheadApplicability &&
                <Col md="1" className='second-section'>
                  <div className='costing-border-inner-section'>
                    <Col md="12" className='text-center'>Remark</Col>
                    <Col md="12"> <Popup trigger={<button id={`popUpTriggerOverHead`} title="Remark" className="Comment-box" type={'button'} />}
                      position="top center">
                      <TextAreaHookForm
                        label="Remark:"
                        name={`overHeadRemark`}
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
                        errors={errors.overHeadRemark}
                        disabled={CostingViewMode}
                        hidden={false}
                      />
                      <Row>
                        <Col md="12" className='remark-btn-container'>
                          <button className='submit-button mr-2' disabled={(CostingViewMode) ? true : false} onClick={() => onRemarkPopUpClickOverHead()} > <div className='save-icon'></div> </button>
                          <button className='reset' onClick={() => onRemarkPopUpCloseOverHead()} > <div className='cancel-icon'></div></button>
                        </Col>
                      </Row>
                    </Popup></Col>
                  </div>
                </Col>
              }

              {/* new section from below with heasing */}
              <Col md={"12"} className="pt-3">
                <div className="left-border">
                  {`Profits ${profitObj && profitObj.ProfitApplicability ? '(' + profitObj.ProfitApplicability + ')' : '-'}`}
                </div>
              </Col>
              {initialConfiguration?.IsShowCRMHead && <Col md="3">
                <SearchableSelectHookForm
                  name={`crmHeadProfit`}
                  type="text"
                  label="CRM Head"
                  errors={errors.crmHeadProfit}
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
                  handleChange={onCRMHeadChangeProfit}
                  disabled={CostingViewMode}
                />
              </Col>}
              <Col md={profitObj?.ProfitApplicability ? "11" : "12"} className='first-section'>
                <OverheadProfitTable
                  data={profitObj}
                  type="Profit"
                  Controller={Controller}
                  control={control}
                  register={register}
                  setValue={setValue}
                  getValues={getValues}
                  errors={errors}
                  CostingViewMode={CostingViewMode}
                  initialConfiguration={initialConfiguration}
                  onCostChange={(e, item) => handleCostChange(e, item, 'Profit')}
                  isFixedApplicable={profitObj?.CostingApplicabilityDetails?.some(detail => detail.Applicability === 'Fixed')}
                />
              </Col>
              {
                profitObj && profitObj.ProfitApplicability &&
                <Col md="1" className='second-section profit'>
                  <div className='costing-border-inner-section'>
                    <Col md="12" className='text-center'>Remark</Col>
                    <Col md="12"> <Popup trigger={<button id={`popUpTriggerProfit`} title="Remark" className="Comment-box" type={'button'} />}
                      position="top center">
                      <TextAreaHookForm
                        label="Remark:"
                        name={`profitRemark`}
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
                        errors={errors.profitRemark}
                        disabled={CostingViewMode}
                        hidden={false}
                      />
                      <Row>
                        <Col md="12" className='remark-btn-container'>
                          <button className='submit-button mr-2' disabled={(CostingViewMode) ? true : false} onClick={() => onRemarkPopUpClickProfit()} > <div className='save-icon'></div> </button>
                          <button className='reset' onClick={() => onRemarkPopUpCloseProfit()} > <div className='cancel-icon'></div></button>
                        </Col>
                      </Row>
                    </Popup></Col>
                  </div>
                </Col>
              }

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
              clearErrors={clearErrors}
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
            <Row className=" no-gutters justify-content-between btn-sticky-container overhead-profit-save-btn">
              <div className="col-sm-12 text-right bluefooter-butn ">
                {!CostingViewMode && <button
                  type={'button'}
                  id="overhead_profit_save"
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
