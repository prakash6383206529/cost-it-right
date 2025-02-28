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
    overHeadRemark: CostingOverheadDetail.Remark ? CostingOverheadDetail.Remark : '',
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

  const { CostingEffectiveDate, CostingDataList, IsIncludedSurfaceInOverheadProfit, IsIncludedToolCost, ToolTabData, OverheadProfitTabData, isBreakupBoughtOutPartCostingFromAPI, currencySource,exchangeRateData } = useSelector(state => state.costing)

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

    //GET FIXED VALUE IN GET API
    if (Object.keys(CostingOverheadDetail).length > 0) {
      setOverheadValues(CostingOverheadDetail, false)
    }

    //GET FIXED VALUE IN GET API
    if (Object.keys(CostingProfitDetail).length > 0) {
      setProfitValues(CostingProfitDetail, false)
      setValue('crmHeadProfit', CostingProfitDetail && CostingProfitDetail.ProfitCRMHead && {
        label: CostingProfitDetail.ProfitCRMHead, value: 1
      })
      setValue('profitRemark', CostingProfitDetail && CostingProfitDetail.Remark ? CostingProfitDetail.Remark : '')
    }

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
      if (headerCosts !== undefined && overheadFixedFieldValues !== undefined && overheadObj && overheadObj.IsOverheadFixedApplicable) {
        setValue('OverheadFixedCost', '-')
        setValue('OverheadFixedTotalCost', checkForDecimalAndNull(overheadFixedFieldValues, initialConfiguration?.NoOfDecimalForPrice))
        setOverheadObj({
          ...overheadObj,
          OverheadFixedPercentage: overheadFixedFieldValues,
          OverheadFixedCost: '-',
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
      if (headerCosts !== undefined && profitFixedFieldValues !== undefined && profitObj && profitObj.IsProfitFixedApplicable) {
        setValue('ProfitFixedCost', '-')
        setValue('ProfitFixedTotalCost', checkForDecimalAndNull(profitFixedFieldValues, initialConfiguration?.NoOfDecimalForPrice))
        setProfitObj({
          ...profitObj,
          ProfitFixedPercentage: profitFixedFieldValues,
          ProfitFixedCost: '-',
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

    if (IsDropdownClicked && !CostingViewMode && !CheckIsCostingDateSelected(CostingEffectiveDate, currencySource,exchangeRateData)) {
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
            let showWarning = false
            if (applicabilityList.includes(Data?.CostingOverheadDetail?.OverheadApplicability)) {
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

            if (applicabilityList.includes(Data?.CostingProfitDetail?.ProfitApplicability)) {
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
    let totalToolCost = 0
    if (IsIncludedToolCost) {
      totalToolCost = checkForDecimalAndNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost, initialConfiguration?.NoOfDecimalForPrice)
    } else {
      totalToolCost = 0
    }

    if (!CostingViewMode) {

      let OverheadRMCost = 0
      let OverheadRMTotalCost = 0
      let OverheadBOPCost = 0
      let OverheadBOPTotalCost = 0
      let OverheadCCCost = 0
      let OverheadCCTotalCost = 0

      let OverheadRMPercentage = (dataObj?.IsOverheadRMApplicable ? checkForNull(dataObj?.OverheadRMPercentage) : '')
      let OverheadBOPPercentage = (dataObj?.IsOverheadBOPApplicable ? checkForNull(dataObj?.OverheadBOPPercentage) : '')
      let OverheadCCPercentage = (dataObj?.IsOverheadCCApplicable ? checkForNull(dataObj?.OverheadCCPercentage) : '')

      const CutOffCost = checkForNull(CostingDataList && CostingDataList[0]?.RawMaterialCostWithCutOff)
      const IsCutOffApplicable = CostingDataList[0]?.IsRMCutOffApplicable;

      // IF BLOCK WILL GET EXECUTED WHEN TECHNOLOGY FOR COSTING IS ASSEMBLY FOR OTHER TECHNOLOGIES ELSE WILL EXECUTE
      if (partType) {
        OverheadRMCost = checkForNull(headerCosts?.NetRawMaterialsCost)
        OverheadCCCost = checkForNull(headerCosts?.ProcessCostTotal) + checkForNull(headerCosts?.OperationCostTotal) + totalToolCost
        OverheadBOPCost = checkForNull(headerCosts?.NetBoughtOutPartCost)
        OverheadRMTotalCost = OverheadRMCost * calculatePercentage(OverheadRMPercentage)
        OverheadCCTotalCost = OverheadCCCost * calculatePercentage(OverheadCCPercentage)
        OverheadBOPTotalCost = OverheadBOPCost * calculatePercentage(OverheadBOPPercentage)
      } else {
        OverheadRMCost = IsCutOffApplicable ? checkForNull(CutOffCost) : checkForNull(headerCosts?.NetRawMaterialsCost)
        OverheadRMTotalCost = (IsCutOffApplicable ? checkForNull(CutOffCost) : checkForNull(headerCosts?.NetRawMaterialsCost)) * calculatePercentage(checkForNull(OverheadRMPercentage))
        OverheadBOPCost = checkForNull(headerCosts && headerCosts?.NetBoughtOutPartCost)
        OverheadBOPTotalCost = checkForNull(OverheadBOPCost) * calculatePercentage(checkForNull(OverheadBOPPercentage))
        OverheadCCCost = (checkForNull(headerCosts && headerCosts?.ProcessCostTotal) + checkForNull(headerCosts && headerCosts?.OperationCostTotal)) + totalToolCost
        OverheadCCTotalCost = OverheadCCCost * calculatePercentage(OverheadCCPercentage)
      }

      if (dataObj?.IsOverheadFixedApplicable && IsAPIResponse === false) {

        setValue('OverheadFixedPercentage', dataObj?.IsOverheadFixedApplicable ? checkForDecimalAndNull(dataObj?.OverheadFixedPercentage, initialConfiguration?.NoOfDecimalForPrice) : '')
        setValue('OverheadFixedCost', '-')
        setValue('OverheadFixedTotalCost', dataObj?.IsOverheadFixedApplicable ? checkForDecimalAndNull(dataObj?.OverheadFixedPercentage, initialConfiguration?.NoOfDecimalForPrice) : '')
        setOverheadObj({
          ...overheadObj,
          OverheadFixedPercentage: dataObj?.OverheadFixedPercentage,
          OverheadFixedCost: '-',
          OverheadFixedTotalCost: dataObj?.OverheadFixedPercentage,
        })
      }
      if (dataObj?.IsOverheadCombined && IsAPIResponse === false) {

        const RMBOPCC = headerCosts?.NetBoughtOutPartCost + headerCosts?.NetRawMaterialsCost + headerCosts?.ProcessCostTotal + headerCosts?.OperationCostTotal
        const CutOffRMBOPCCTotal = IsCutOffApplicable && headerCosts ? CutOffCost + headerCosts?.NetBoughtOutPartCost + (headerCosts?.ProcessCostTotal + headerCosts?.OperationCostTotal) : RMBOPCC;
        setValue('OverheadPercentage', dataObj?.IsOverheadCombined ? checkForDecimalAndNull(dataObj?.OverheadPercentage, initialConfiguration?.NoOfDecimalForPrice) : '')
        setValue('OverheadCombinedCost', headerCosts && checkForDecimalAndNull(CutOffRMBOPCCTotal, initialConfiguration?.NoOfDecimalForPrice))
        setValue('OverheadCombinedTotalCost', checkForDecimalAndNull((CutOffRMBOPCCTotal * calculatePercentage(dataObj?.OverheadPercentage)), initialConfiguration?.NoOfDecimalForPrice))
        setOverheadObj({
          ...overheadObj,
          OverheadPercentage: dataObj?.OverheadPercentage,
          OverheadCombinedCost: headerCosts && checkForNull(CutOffRMBOPCCTotal),
          OverheadCombinedTotalCost: checkForNull(CutOffRMBOPCCTotal) * calculatePercentage(checkForNull(dataObj?.OverheadPercentage)),
        })
      }

      if (dataObj?.IsOverheadRMApplicable && dataObj?.IsOverheadBOPApplicable && dataObj?.IsOverheadCCApplicable) {
        //RM
        setValue('OverheadRMPercentage', checkForDecimalAndNull(OverheadRMPercentage, initialConfiguration?.NoOfDecimalForPrice))
        setValue('OverheadRMCost', checkForDecimalAndNull(OverheadRMCost, initialConfiguration?.NoOfDecimalForPrice))
        setValue('OverheadRMTotalCost', checkForDecimalAndNull(OverheadRMTotalCost, initialConfiguration?.NoOfDecimalForPrice))
        //BOP
        setValue('OverheadBOPPercentage', checkForDecimalAndNull(OverheadBOPPercentage, initialConfiguration?.NoOfDecimalForPrice))
        setValue('OverheadBOPCost', checkForDecimalAndNull(OverheadBOPCost, initialConfiguration?.NoOfDecimalForPrice))
        setValue('OverheadBOPTotalCost', checkForDecimalAndNull(OverheadBOPTotalCost, initialConfiguration?.NoOfDecimalForPrice))

        //CC
        setValue('OverheadCCPercentage', OverheadCCPercentage)
        setValue('OverheadCCCost', checkForDecimalAndNull(OverheadCCCost, initialConfiguration?.NoOfDecimalForPrice))
        setValue('OverheadCCTotalCost', checkForDecimalAndNull(OverheadCCTotalCost, initialConfiguration?.NoOfDecimalForPrice))

        setTempOverheadObj({
          ...tempOverheadObj,
          OverheadRMPercentage: OverheadRMPercentage,
          OverheadRMCost: OverheadRMCost,
          OverheadRMTotalCost: OverheadRMTotalCost,
          OverheadBOPPercentage: OverheadBOPPercentage,
          OverheadBOPCost: OverheadBOPCost,
          OverheadBOPTotalCost: OverheadBOPTotalCost,
          OverheadCCPercentage: OverheadCCPercentage,
          OverheadCCCost: OverheadCCCost,
          OverheadCCTotalCost: OverheadCCTotalCost
        })
      }

      if (dataObj?.IsOverheadRMApplicable && !dataObj?.IsOverheadBOPApplicable && !dataObj?.IsOverheadCCApplicable) {

        setValue('OverheadRMPercentage', OverheadRMPercentage)
        setValue('OverheadRMCost', checkForDecimalAndNull(OverheadRMCost, initialConfiguration?.NoOfDecimalForPrice))
        setValue('OverheadRMTotalCost', checkForDecimalAndNull(OverheadRMTotalCost, initialConfiguration?.NoOfDecimalForPrice))
        setTempOverheadObj({
          ...tempOverheadObj,
          OverheadRMPercentage: OverheadRMPercentage,
          OverheadRMCost: OverheadRMCost,
          OverheadRMTotalCost: OverheadRMTotalCost
        })
      }
      if (dataObj?.IsOverheadBOPApplicable && !dataObj?.IsOverheadRMApplicable && !dataObj?.IsOverheadCCApplicable) {
        setValue('OverheadBOPPercentage', checkForDecimalAndNull(OverheadBOPPercentage, initialConfiguration?.NoOfDecimalForPrice))
        setValue('OverheadBOPCost', checkForDecimalAndNull(OverheadBOPCost, initialConfiguration?.NoOfDecimalForPrice))
        setValue('OverheadBOPTotalCost', checkForDecimalAndNull(OverheadBOPTotalCost, initialConfiguration?.NoOfDecimalForPrice))
        setTempOverheadObj({
          ...tempOverheadObj,
          OverheadBOPPercentage: OverheadBOPPercentage,
          OverheadBOPCost: OverheadBOPCost,
          OverheadBOPTotalCost: OverheadBOPTotalCost,
        })
      }
      if (dataObj?.IsOverheadCCApplicable && !dataObj?.IsOverheadBOPApplicable && !dataObj?.IsOverheadRMApplicable) {
        setValue('OverheadCCPercentage', checkForDecimalAndNull(OverheadCCPercentage, initialConfiguration?.NoOfDecimalForPrice))
        setValue('OverheadCCCost', checkForDecimalAndNull(OverheadCCCost, initialConfiguration?.NoOfDecimalForPrice))
        setValue('OverheadCCTotalCost', checkForDecimalAndNull(OverheadCCTotalCost, initialConfiguration?.NoOfDecimalForPrice))
        setTempOverheadObj({
          ...tempOverheadObj,
          OverheadCCPercentage: OverheadCCPercentage,
          OverheadCCCost: OverheadCCCost,
          OverheadCCTotalCost: OverheadCCTotalCost
        })
      }
      if (dataObj?.IsOverheadRMApplicable && dataObj?.IsOverheadCCApplicable && !dataObj?.IsOverheadBOPApplicable) {
        setValue('OverheadRMPercentage', checkForDecimalAndNull(OverheadRMPercentage, initialConfiguration?.NoOfDecimalForPrice))
        setValue('OverheadRMCost', checkForDecimalAndNull(OverheadRMCost, initialConfiguration?.NoOfDecimalForPrice))
        setValue('OverheadRMTotalCost', checkForDecimalAndNull(OverheadRMTotalCost, initialConfiguration?.NoOfDecimalForPrice))
        setValue('OverheadCCPercentage', checkForDecimalAndNull(OverheadCCPercentage, initialConfiguration?.NoOfDecimalForPrice))
        setValue('OverheadCCCost', checkForDecimalAndNull(OverheadCCCost, initialConfiguration?.NoOfDecimalForPrice))
        setValue('OverheadCCTotalCost', checkForDecimalAndNull(OverheadCCTotalCost, initialConfiguration?.NoOfDecimalForPrice))

        setTempOverheadObj({
          ...tempOverheadObj,
          OverheadRMPercentage: OverheadRMPercentage,
          OverheadRMCost: OverheadRMCost,
          OverheadRMTotalCost: OverheadRMTotalCost,
          OverheadCCPercentage: OverheadCCPercentage,
          OverheadCCCost: OverheadCCCost,
          OverheadCCTotalCost: OverheadCCTotalCost
        })
      }
      if (dataObj?.IsOverheadRMApplicable && dataObj?.IsOverheadBOPApplicable && !dataObj?.IsOverheadCCApplicable) {
        setValue('OverheadRMPercentage', checkForDecimalAndNull(OverheadRMPercentage, initialConfiguration?.NoOfDecimalForPrice))
        setValue('OverheadRMCost', checkForDecimalAndNull(OverheadRMCost, initialConfiguration?.NoOfDecimalForPrice))
        setValue('OverheadRMTotalCost', checkForDecimalAndNull(OverheadRMTotalCost, initialConfiguration?.NoOfDecimalForPrice))
        setValue('OverheadBOPPercentage', checkForDecimalAndNull(OverheadBOPPercentage, initialConfiguration?.NoOfDecimalForPrice))
        setValue('OverheadBOPCost', checkForDecimalAndNull(OverheadBOPCost, initialConfiguration?.NoOfDecimalForPrice))
        setValue('OverheadBOPTotalCost', checkForDecimalAndNull(OverheadBOPTotalCost, initialConfiguration?.NoOfDecimalForPrice))

        setTempOverheadObj({
          ...tempOverheadObj,
          OverheadRMPercentage: OverheadRMPercentage,
          OverheadRMCost: OverheadRMCost,
          OverheadRMTotalCost: OverheadRMTotalCost,
          OverheadBOPPercentage: OverheadBOPPercentage,
          OverheadBOPCost: OverheadBOPCost,
          OverheadBOPTotalCost: OverheadBOPTotalCost,
        })
      }
      if (dataObj?.IsOverheadBOPApplicable && dataObj?.IsOverheadCCApplicable && !dataObj?.IsOverheadRMApplicable) {
        setValue('OverheadBOPPercentage', checkForDecimalAndNull(OverheadBOPPercentage, initialConfiguration?.NoOfDecimalForPrice))
        setValue('OverheadBOPCost', checkForDecimalAndNull(OverheadBOPCost, initialConfiguration?.NoOfDecimalForPrice))
        setValue('OverheadBOPTotalCost', checkForDecimalAndNull(OverheadBOPTotalCost, initialConfiguration?.NoOfDecimalForPrice))
        setValue('OverheadCCPercentage', checkForDecimalAndNull(OverheadCCPercentage, initialConfiguration?.NoOfDecimalForPrice))
        setValue('OverheadCCCost', checkForDecimalAndNull(OverheadCCCost, initialConfiguration?.NoOfDecimalForPrice))
        setValue('OverheadCCTotalCost', checkForDecimalAndNull(OverheadCCTotalCost, initialConfiguration?.NoOfDecimalForPrice))

        setTempOverheadObj({
          ...tempOverheadObj,
          OverheadBOPPercentage: OverheadBOPPercentage,
          OverheadBOPCost: OverheadBOPCost,
          OverheadBOPTotalCost: OverheadBOPTotalCost,
          OverheadCCPercentage: OverheadCCPercentage,
          OverheadCCCost: OverheadCCCost,
          OverheadCCTotalCost: OverheadCCTotalCost
        })
      }
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
      const RMBOPCC = headerCosts.NetRawMaterialsCost + headerCosts.NetBoughtOutPartCost + headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal
      const CutOffCost = checkForNull(CostingDataList && CostingDataList[0]?.RawMaterialCostWithCutOff)
      const CutOffRMBOPCCTotal = IsCutOffApplicable && headerCosts ? CutOffCost + headerCosts.NetBoughtOutPartCost + headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal : RMBOPCC; //NEED TO ASK HERE ALSO
      const CutOffRMC = CutOffCost;

      // IF BLOCK WILL GET EXECUTED WHEN TECHNOLOGY FOR COSTING IS ASSEMBLY FOR OTHER TECHNOLOGIES ELSE WILL EXECUTE
      if (partType) {
        ProfitRMCost = checkForNull(headerCosts?.NetRawMaterialsCost)
        ProfitCCCost = checkForNull(headerCosts?.ProcessCostTotal) + checkForNull(headerCosts?.OperationCostTotal) + totalToolCost
        ProfitBOPCost = checkForNull(headerCosts?.NetBoughtOutPartCost)
        ProfitRMTotalCost = ProfitRMCost * calculatePercentage(ProfitRMPercentage)
        ProfitCCTotalCost = ProfitCCCost * calculatePercentage(ProfitCCPercentage)
        ProfitBOPTotalCost = ProfitBOPCost * calculatePercentage(ProfitBOPPercentage)
      } else {
        ProfitRMCost = IsCutOffApplicable ? checkForNull(CutOffRMC) : checkForNull(headerCosts?.NetRawMaterialsCost)
        ProfitRMTotalCost = (IsCutOffApplicable ? checkForNull(CutOffRMC) : checkForNull(headerCosts?.NetRawMaterialsCost)) * calculatePercentage(checkForNull(ProfitRMPercentage))
        ProfitBOPCost = checkForNull(headerCosts && headerCosts?.NetBoughtOutPartCost)
        ProfitBOPTotalCost = checkForNull(ProfitBOPCost) * calculatePercentage(checkForNull(ProfitBOPPercentage))
        ProfitCCCost = (checkForNull(headerCosts && headerCosts?.ProcessCostTotal) + checkForNull(headerCosts && headerCosts?.OperationCostTotal)) + totalToolCost
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

        const RMBOPCC = headerCosts?.NetBoughtOutPartCost + headerCosts?.NetRawMaterialsCost + headerCosts?.ProcessCostTotal + headerCosts?.OperationCostTotal
        const CutOffRMBOPCCTotal = IsCutOffApplicable && headerCosts ? CutOffRMC + headerCosts?.NetBoughtOutPartCost + (headerCosts?.ProcessCostTotal + headerCosts?.OperationCostTotal) : RMBOPCC;
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
      let RM_CC_BOP = 0
      let RM_CC = 0
      let BOP_CC = 0
      let RM_BOP = 0
      let CC = 0

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
        let combinedCost = checkForNull(headerCosts?.ProcessCostTotal) + checkForNull(headerCosts?.OperationCostTotal)
        const BOPTotalCost = checkForNull(headerCosts?.NetBoughtOutPartCost)
        const PartCost = checkForNull(headerCosts?.NetRawMaterialsCost)

        CC = checkForNull(headerCosts?.ProcessCostTotal) + checkForNull(headerCosts?.OperationCostTotal) + totalToolCost
        RM_CC_BOP = checkForNull(PartCost) + checkForNull(combinedCost) + checkForNull(BOPTotalCost) + totalToolCost
        RM_CC = checkForNull(PartCost) + checkForNull(combinedCost) + totalToolCost
        BOP_CC = checkForNull(combinedCost) + checkForNull(BOPTotalCost) + totalToolCost
        RM_BOP = checkForNull(PartCost) + checkForNull(BOPTotalCost)
      } else {

        const IsCutOffApplicable = CostingDataList[0]?.IsRMCutOffApplicable;
        const CutOffCost = checkForNull(CostingDataList && CostingDataList[0]?.RawMaterialCostWithCutOff)
        const CutOffRMC = CutOffCost;
        const ConversionCostForCalculation = costData?.IsAssemblyPart ? (checkForNull(headerCosts?.NetConversionCost) - checkForNull(headerCosts?.TotalOtherOperationCostPerAssembly)) : (checkForNull(headerCosts?.ProcessCostTotal) + checkForNull(headerCosts?.OperationCostTotal))
        const RMBOPCC = headerCosts?.NetRawMaterialsCost + headerCosts?.NetBoughtOutPartCost + ConversionCostForCalculation

        CC = ConversionCostForCalculation + totalToolCost
        RM_CC_BOP = (IsCutOffApplicable && headerCosts) ? (CutOffCost + headerCosts.NetBoughtOutPartCost + ConversionCostForCalculation) + totalToolCost : RMBOPCC + totalToolCost;
        RM_CC = (IsCutOffApplicable ? CutOffRMC : headerCosts?.NetRawMaterialsCost) + ConversionCostForCalculation + totalToolCost;
        BOP_CC = headerCosts?.NetBoughtOutPartCost + ConversionCostForCalculation + totalToolCost;
        RM_BOP = (IsCutOffApplicable ? CutOffRMC : headerCosts?.NetRawMaterialsCost) + headerCosts?.NetBoughtOutPartCost;

      }

      setOverheadValues(overheadObj, false)
      setProfitValues(profitObj, false)

      // START HERE ADD CC IN OVERHEAD
      if (IsIncludedSurfaceInOverheadProfit && IsSurfaceTreatmentAdded === false && overheadObj && overheadObj?.IsOverheadCCApplicable) {

        const overheadCCCost = checkForNull(CC) + checkForNull(NetSurfaceTreatmentCost)
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
        const overheadCCCost = checkForNull(CC)
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

        const profitCCCost = checkForNull(CC) + checkForNull(NetSurfaceTreatmentCost)
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

        const profitCCCost = checkForNull(CC)
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

              overheadCombinedCost = checkForNull(RM_CC_BOP) + checkForNull(NetSurfaceTreatmentCost)
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
              overheadCombinedCost = checkForNull(RM_CC) + checkForNull(NetSurfaceTreatmentCost)
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

            overheadCombinedCost = checkForNull(BOP_CC) + checkForNull(NetSurfaceTreatmentCost)
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
              overheadCombinedCost = checkForNull(RM_CC_BOP)
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
              overheadCombinedCost = checkForNull(RM_CC)
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

            overheadCombinedCost = checkForNull(BOP_CC)
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
              profitCombinedCost = checkForNull(RM_CC_BOP) + checkForNull(NetSurfaceTreatmentCost)
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
              profitCombinedCost = checkForNull(RM_CC) + checkForNull(NetSurfaceTreatmentCost)
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

            profitCombinedCost = checkForNull(BOP_CC) + checkForNull(NetSurfaceTreatmentCost)
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
              profitCombinedCost = checkForNull(RM_CC_BOP)
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
              profitCombinedCost = checkForNull(RM_CC)
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

            profitCombinedCost = checkForNull(BOP_CC)
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
                          {`${overheadObj && overheadObj.OverheadApplicability ? overheadObj.OverheadApplicability : '-'}`}
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
                            validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                          }}
                          handleChange={() => { dispatch(isOverheadProfitDataChange(true)) }}
                          defaultValue={overheadObj.OverheadFixedPercentage !== null ? checkForDecimalAndNull(overheadObj.OverheadFixedPercentage, initialConfiguration?.NoOfDecimalForPrice) : ''}
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
                          defaultValue={overheadObj.OverheadFixedCost !== null ? checkForDecimalAndNull(overheadObj.OverheadFixedCost, initialConfiguration?.NoOfDecimalForPrice) : ''}
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
                          defaultValue={overheadObj.OverheadFixedTotalCost !== null ? checkForDecimalAndNull(overheadObj.OverheadFixedTotalCost, initialConfiguration?.NoOfDecimalForPrice) : ''}
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
                          {`${overheadObj && overheadObj.OverheadApplicability ? '(' + overheadObj.OverheadApplicability + ')' : '-'}`}
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
                          defaultValue={overheadObj.OverheadPercentage !== null ? checkForDecimalAndNull(overheadObj.OverheadPercentage, initialConfiguration?.NoOfDecimalForPrice) : ''}
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
                            defaultValue={overheadObj.OverheadCombinedCost !== null ? checkForDecimalAndNull(overheadObj.OverheadCombinedCost, initialConfiguration?.NoOfDecimalForPrice) : ''}
                            className=""
                            customClassName={'withBorder'}
                            errors={errors.OverheadCombinedCost}
                            disabled={true}
                          />
                          {OverheadAndProfitTooltip("OverheadCombinedCost", overheadObj, CostingDataList, showWarning, initialConfiguration?.NoOfDecimalForPrice)}


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
                          defaultValue={overheadObj.OverheadCombinedTotalCost !== null ? checkForDecimalAndNull(overheadObj.OverheadCombinedTotalCost, initialConfiguration?.NoOfDecimalForPrice) : ''}
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
                          {`${(overheadObj && overheadObj.OverheadApplicability.includes(PART_COST)) ? PART_COST : 'RM'}`}
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
                          defaultValue={overheadObj.OverheadRMPercentage !== null ? checkForDecimalAndNull(overheadObj.OverheadRMPercentage, initialConfiguration?.NoOfDecimalForPrice) : ''}
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
                            defaultValue={overheadObj.OverheadRMCost !== null ? checkForDecimalAndNull(overheadObj.OverheadRMCost, initialConfiguration?.NoOfDecimalForPrice) : ''}
                            className=""
                            customClassName={'withBorder'}
                            errors={errors.OverheadRMCost}
                            disabled={true}
                          />

                          {OverheadAndProfitTooltip("OverheadRMCost", "", CostingDataList, showWarning, initialConfiguration?.NoOfDecimalForPrice)}

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
                          defaultValue={overheadObj.OverheadRMTotalCost !== null ? checkForDecimalAndNull(overheadObj.OverheadRMTotalCost, initialConfiguration?.NoOfDecimalForPrice) : ''}
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
                          {`${overheadObj && overheadObj.OverheadApplicability ? 'BOP' : '-'}`}
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
                          defaultValue={overheadObj.OverheadBOPPercentage !== null ? checkForDecimalAndNull(overheadObj.OverheadBOPPercentage, initialConfiguration?.NoOfDecimalForPrice) : ''}
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
                          defaultValue={overheadObj.OverheadBOPCost !== null ? checkForDecimalAndNull(overheadObj.OverheadBOPCost, initialConfiguration?.NoOfDecimalForPrice) : ''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.OverheadBOPCost}
                          disabled={true}
                        />
                        {OverheadAndProfitTooltip("OverheadBOPCost", "", CostingDataList, showWarning, initialConfiguration?.NoOfDecimalForPrice)}
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
                          defaultValue={overheadObj.OverheadBOPTotalCost !== null ? checkForDecimalAndNull(overheadObj.OverheadBOPTotalCost, initialConfiguration?.NoOfDecimalForPrice) : ''}
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
                          {`${overheadObj && overheadObj.OverheadApplicability ? 'CC' : '-'}`}
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
                          defaultValue={overheadObj.OverheadCCPercentage !== null ? checkForDecimalAndNull(overheadObj.OverheadCCPercentage, initialConfiguration?.NoOfDecimalForPrice) : ''}
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
                          defaultValue={overheadObj.OverheadCCCost !== null ? checkForDecimalAndNull(overheadObj.OverheadCCCost, initialConfiguration?.NoOfDecimalForPrice) : ''}
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
                          defaultValue={overheadObj.OverheadCCTotalCost !== null ? checkForDecimalAndNull(overheadObj.OverheadCCTotalCost, initialConfiguration?.NoOfDecimalForPrice) : ''}
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
                          {`${profitObj && profitObj.ProfitApplicability ? '(' + profitObj.ProfitApplicability + ')' : '-'}`}
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
                            validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                          }}
                          handleChange={() => { }}
                          defaultValue={profitObj.ProfitFixedPercentage !== null ? checkForDecimalAndNull(profitObj.ProfitFixedPercentage, initialConfiguration?.NoOfDecimalForPrice) : ''}
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
                          defaultValue={profitObj.ProfitFixedCost !== null ? checkForDecimalAndNull(profitObj.ProfitFixedCost, initialConfiguration?.NoOfDecimalForPrice) : ''}
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
                          defaultValue={profitObj.ProfitFixedTotalCost !== null ? checkForDecimalAndNull(profitObj.ProfitFixedTotalCost, initialConfiguration?.NoOfDecimalForPrice) : ''}
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
                          {`${profitObj && profitObj.ProfitApplicability ? '(' + profitObj.ProfitApplicability + ')' : '-'}`}
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
                          defaultValue={profitObj.ProfitPercentage !== null ? checkForDecimalAndNull(profitObj.ProfitPercentage, initialConfiguration?.NoOfDecimalForPrice) : ''}
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
                            defaultValue={profitObj.ProfitCombinedCost !== null ? checkForDecimalAndNull(profitObj.ProfitCombinedCost, initialConfiguration?.NoOfDecimalForPrice) : ''}
                            className=""
                            customClassName={'withBorder'}
                            errors={errors.ProfitCombinedCost}
                            disabled={true}
                          />
                          {OverheadAndProfitTooltip("ProfitCombinedCost", profitObj, CostingDataList, showWarning, initialConfiguration?.NoOfDecimalForPrice)}
                          {(profitObj && profitObj?.ProfitApplicability.includes('RM') && CostingDataList[0]?.IsRMCutOffApplicable === true) && false && <TooltipCustom id="ProfitCombinedCost" disabledIcon={true} customClass="mt-2 d-none" tooltipText={`RM cut-off price ${checkForDecimalAndNull(CostingDataList && CostingDataList[0]?.RawMaterialCostWithCutOff, initialConfiguration?.NoOfDecimalForPrice)} applied`} />}
                        </div>
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
                          defaultValue={profitObj.ProfitCombinedTotalCost !== null ? checkForDecimalAndNull(profitObj.ProfitCombinedTotalCost, initialConfiguration?.NoOfDecimalForPrice) : ''}
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
                          {`${(profitObj && profitObj.ProfitApplicability.includes(PART_COST)) ? PART_COST : 'RM'}`}
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
                          defaultValue={profitObj.ProfitRMPercentage !== null ? checkForDecimalAndNull(profitObj.ProfitRMPercentage, initialConfiguration?.NoOfDecimalForPrice) : ''}
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
                            defaultValue={profitObj.ProfitRMCost !== null ? checkForDecimalAndNull(profitObj.ProfitRMCost, initialConfiguration?.NoOfDecimalForPrice) : ''}
                            className=""
                            customClassName={'withBorder'}
                            errors={errors.ProfitRMCost}
                            disabled={true}
                          />
                          {OverheadAndProfitTooltip("ProfitRMCost", "", CostingDataList, showWarning, initialConfiguration?.NoOfDecimalForPrice)}
                          {(CostingDataList && CostingDataList[0]?.IsRMCutOffApplicable) && <></>}
                        </div>
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
                          defaultValue={profitObj.ProfitRMTotalCost !== null ? checkForDecimalAndNull(profitObj.ProfitRMTotalCost, initialConfiguration?.NoOfDecimalForPrice) : ''}
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
                          {`${profitObj && profitObj.ProfitApplicability ? 'BOP' : '-'}`}
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
                          defaultValue={profitObj.ProfitBOPPercentage !== null ? checkForDecimalAndNull(profitObj.ProfitBOPPercentage, initialConfiguration?.NoOfDecimalForPrice) : ''}
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
                          defaultValue={profitObj.ProfitBOPCost !== null ? checkForDecimalAndNull(profitObj.ProfitBOPCost, initialConfiguration?.NoOfDecimalForPrice) : ''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.ProfitBOPCost}
                          disabled={true}
                        />
                        {OverheadAndProfitTooltip("ProfitBOPCost", "", CostingDataList, showWarning, initialConfiguration?.NoOfDecimalForPrice)}
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
                          defaultValue={profitObj.ProfitBOPTotalCost !== null ? checkForDecimalAndNull(profitObj.ProfitBOPTotalCost, initialConfiguration?.NoOfDecimalForPrice) : ''}
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
                          {`${profitObj && profitObj.ProfitApplicability ? 'CC' : '-'}`}
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
                          defaultValue={profitObj.ProfitCCPercentage !== null ? checkForDecimalAndNull(profitObj.ProfitCCPercentage, initialConfiguration?.NoOfDecimalForPrice) : ''}
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
                          defaultValue={profitObj.ProfitCCCost !== null ? checkForDecimalAndNull(profitObj.ProfitCCCost, initialConfiguration?.NoOfDecimalForPrice) : ''}
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
                          defaultValue={profitObj.ProfitCCTotalCost !== null ? checkForDecimalAndNull(profitObj.ProfitCCTotalCost, initialConfiguration?.NoOfDecimalForPrice) : ''}
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
