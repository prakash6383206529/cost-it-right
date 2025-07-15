import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller, useWatch, } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Row, } from 'reactstrap';
import { SearchableSelectHookForm, TextAreaHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs';
import { calculatePercentage, checkForDecimalAndNull, checkForNull, CheckIsCostingDateSelected, filterApplicabilityDetails, getConfigurationKey, isMultiTechnologyCosting, OverheadAndProfitTooltip, } from '../../../../../helper';
import { fetchModelTypeAPI } from '../../../../../actions/Common';
import { getOverheadProfitDataByModelType, gridDataAdded, isOverheadProfitDataChange, setOverheadProfitErrors, setSurfaceAndToolCostInOverheadProfit, setSurfaceCostInOverhead, setSurfaceCostInProfit, setToolCostInOverhead, setToolCostInProfit, } from '../../../actions/Costing';
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
    profitRemark: CostingProfitDetail?.Remark ? CostingProfitDetail?.Remark : '',
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

  const { CostingEffectiveDate, CostingDataList, ToolTabData, OverheadProfitTabData, isBreakupBoughtOutPartCostingFromAPI, currencySource, exchangeRateData, IsIncludeApplicabilityForChildParts, IsIncludedSurfaceInOverhead, IsIncludedSurfaceInProfit, IsIncludedToolCostInOverhead, IsIncludedToolCostInProfit } = useSelector(state => state.costing)

  const [overheadObj, setOverheadObj] = useState(CostingOverheadDetail)

  const [profitObj, setProfitObj] = useState(CostingProfitDetail)

  const [applicabilityList, setApplicabilityList] = useState(CostingProfitDetail)
  const [showWarning, setShowWarning] = useState('')
  // partType USED FOR MANAGING CONDITION IN CASE OF NORMAL COSTING AND ASSEMBLY TECHNOLOGY COSTING (TRUE FOR ASSEMBLY TECHNOLOGY)
  const IsMultiVendorCosting = useSelector(state => state.costing?.IsMultiVendorCosting);
  const partType = (IdForMultiTechnology.includes(String(costData?.TechnologyId)) || costData.CostingTypeId === WACTypeId || (costData?.PartType === 'Assembly' && IsMultiVendorCosting))

  const [modelType, setModelType] = useState((data?.CostingPartDetails && data?.CostingPartDetails.ModelType !== null) ? { label: data?.CostingPartDetails?.ModelType, value: data?.CostingPartDetails?.ModelTypeId } : [])

  const [IsSurfaceTreatmentAdded, setIsSurfaceTreatmentAdded] = useState(false)
  const [state, setState] = useState({
    isIncludeSurfaceTreatmentInOverhead: OverheadProfitTabData[0].IsIncludeSurfaceTreatmentWithOverhead,
    isIncludeSurfaceTreatmentInProfit: OverheadProfitTabData[0].IsIncludeSurfaceTreatmentWithProfit,
    isIncludeToolCostInOverhead: OverheadProfitTabData[0].IsIncludeToolCostWithOverhead,
    isIncludeToolCostInProfit: OverheadProfitTabData[0].IsIncludeToolCostWithProfit,
    isPressSurfaceOverhead: false,
    isPressSurfaceProfit: false,
    isPressToolOverhead: false,
    isPressToolProfit: false,
  })

  //INITIAL CALLED EFFECT TO SET VALUES
  useEffect(() => {

    if (data?.CostingPartDetails && data?.CostingPartDetails?.ModelTypeId !== null) {
      handleModelTypeChange({ label: data?.CostingPartDetails?.ModelType, value: data?.CostingPartDetails?.ModelTypeId }, false)
    }

    //GET FIXED VALUE IN GET API
    if (CostingOverheadDetail && Object?.keys(CostingOverheadDetail)?.length > 0) {
      setOverheadValues(CostingOverheadDetail, false)
    }

    //GET FIXED VALUE IN GET API
    if (CostingProfitDetail && Object?.keys(CostingProfitDetail)?.length > 0) {
      setProfitValues(CostingProfitDetail, false)
      setValue('crmHeadProfit', CostingProfitDetail && CostingProfitDetail.ProfitCRMHead && {
        label: CostingProfitDetail.ProfitCRMHead, value: 1
      })
      setValue('profitremark', CostingProfitDetail && CostingProfitDetail.Remark ? CostingProfitDetail.Remark : '')
    }
    if (CostingOverheadDetail && Object?.keys(CostingOverheadDetail)?.length > 0) {
      setOverheadValues(CostingOverheadDetail, false)
      setValue('crmHeadOverhead', CostingOverheadDetail && CostingOverheadDetail.OverheadCRMHead && {
        label: CostingOverheadDetail.OverheadCRMHead, value: 1
      })
      setValue('overheadRemark', CostingOverheadDetail && CostingOverheadDetail.Remark ? CostingOverheadDetail.Remark : '')
    }

  }, []);

  useEffect(() => {
    setOverheadValues(overheadObj, false)
    setProfitValues(profitObj, false)
    setIsSurfaceTreatmentAdded(false)
  }, [state.isIncludeSurfaceTreatmentInOverhead, state.isIncludeSurfaceTreatmentInProfit, state.isIncludeToolCostInOverhead, state.isIncludeToolCostInProfit, SurfaceTreatmentCost.NetSurfaceTreatmentCost, IsIncludeApplicabilityForChildParts])


  // useEffect(() => {
  //   IncludeSurfaceTreatmentCall()
  // }, [SurfaceTreatmentCost.NetSurfaceTreatmentCost])

  // THIS EFFECT INVOKED WHEN RMC CUTOFF VALUE CHANGED ON RMCC TAB
  useEffect(() => {
    UpdateForm()
    setIsSurfaceTreatmentAdded(false)
    setOverheadValues(overheadObj, false)
    setProfitValues(profitObj, false)
  }, [CostingDataList[0]?.IsRMCutOffApplicable])
  useEffect(() => {


    if (OverheadProfitTabData && OverheadProfitTabData.length > 0) {

      if (OverheadProfitTabData[0].IsIncludeSurfaceTreatmentWithOverhead !== null && !state.isPressSurfaceOverhead) {
        dispatch(setSurfaceCostInOverhead(OverheadProfitTabData[0].IsIncludeSurfaceTreatmentWithOverhead, () => { }))
      }
      if (OverheadProfitTabData[0].IsIncludeToolCostWithOverhead !== null && !state.isPressToolOverhead) {
        dispatch(setToolCostInOverhead(OverheadProfitTabData[0].IsIncludeToolCostWithOverhead, () => { }))
      }
      if (OverheadProfitTabData[0].IsIncludeSurfaceTreatmentWithProfit !== null && !state.isPressSurfaceProfit) {
        dispatch(setSurfaceCostInProfit(OverheadProfitTabData[0].IsIncludeSurfaceTreatmentWithProfit, () => { }))
      }
      if (OverheadProfitTabData[0].IsIncludeToolCostWithProfit !== null && !state.isPressToolProfit) {
        dispatch(setToolCostInProfit(OverheadProfitTabData[0].IsIncludeToolCostWithProfit, () => { }))
      }
    }
  }, [OverheadProfitTabData])
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

  useEffect(() => {
    callModelAPI(modelType)
  }, [IsIncludeApplicabilityForChildParts])

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
        "OverheadDetailId": overheadObj?.OverheadDetailId || null,
        "OverheadId": overheadObj?.OverheadId || null,
        "OverheadCRMHead": overheadObj?.OverheadCRMHead || "",
        "Remark": overheadObj?.Remark || "",
        "CostingApplicabilityDetails": partType ? filterApplicabilityDetails(overheadObj?.CostingApplicabilityDetails, IsIncludeApplicabilityForChildParts) : overheadObj?.CostingApplicabilityDetails
      }
      let profitTempObj = {
        "ProfitDetailId": profitObj?.ProfitDetailId || null,
        "ProfitId": profitObj?.ProfitId || null,
        "ProfitCRMHead": profitObj?.ProfitCRMHead || "",
        "Remark": profitObj?.Remark || "",
        "CostingApplicabilityDetails": partType ? filterApplicabilityDetails(profitObj?.CostingApplicabilityDetails, IsIncludeApplicabilityForChildParts) : profitObj?.CostingApplicabilityDetails || []
      }
      if (!CostingViewMode) {
        props.setOverheadDetail({ overheadObj: tempObj, profitObj: profitTempObj, modelType: modelType }, { BOMLevel: data.BOMLevel, PartNumber: data.PartNumber })
      }
    }, 500)

  }, [overheadObj, profitObj]);

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
  const callModelAPI = (modelType) => {
    if (modelType && modelType !== '' && modelType.value !== undefined) {
      const reqParams = {
        ModelTypeId: modelType.value,
        VendorId: (costData.CostingTypeId === VBCTypeId || costData.CostingTypeId === NFRTypeId) ? costData.VendorId : EMPTY_GUID,
        // costingTypeId: Number(costData.CostingTypeId) === NFRTypeId ? VBCTypeId : costData.CostingTypeId,
        costingTypeId: Number(costData.CostingTypeId) === NFRTypeId ? VBCTypeId : Number(costData.CostingTypeId === WACTypeId) ? ZBCTypeId : costData.CostingTypeId,
        EffectiveDate: CostingEffectiveDate,
        plantId: (getConfigurationKey()?.IsPlantRequiredForOverheadProfitInterestRate && costData?.CostingTypeId !== VBCTypeId) ? costData.PlantId : (getConfigurationKey()?.IsDestinationPlantConfigure && costData?.CostingTypeId === VBCTypeId) || (costData?.CostingTypeId === CBCTypeId) || (costData?.CostingTypeId === NFRTypeId) ? costData.DestinationPlantId : EMPTY_GUID,
        customerId: costData.CustomerId,
        rawMaterialGradeId: initialConfiguration?.IsShowRawMaterialInOverheadProfitAndICC ? OverheadProfitTabData[0]?.CostingPartDetails?.RawMaterialGradeId : EMPTY_GUID,
        rawMaterialChildId: initialConfiguration?.IsShowRawMaterialInOverheadProfitAndICC ? OverheadProfitTabData[0]?.CostingPartDetails?.RawMaterialChildId : EMPTY_GUID,
        technologyId: IdForMultiTechnology.includes(String(costData?.TechnologyId)) || (costData?.PartType === 'Assembly' && IsMultiVendorCosting) ? costData?.TechnologyId : null,
        partFamilyId: costData?.PartFamilyId ? costData?.PartFamilyId : EMPTY_GUID,
        IsMultiVendorCosting: IsMultiVendorCosting
      }

      dispatch(getOverheadProfitDataByModelType(reqParams, res => {
        if (res && res.data && res.data.Data) {
          let Data = res.data.Data;
          let showWarning = false

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

          setProfitObj(Data.CostingProfitDetail)
          if (Data.CostingProfitDetail) {
            setTimeout(() => {
              setProfitValues(Data.CostingProfitDetail, true)
            }, 200)
          }
          dispatch(gridDataAdded(true))

          if (showWarning) {
            setShowWarning(true)
          } else {
            setShowWarning(false)
          }
          //setRejectionObj(Data.CostingRejectionDetail)
          // setIsSurfaceTreatmentAdded(false)
        }
      }))
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

      setOverheadObj({})
      setProfitObj({})
      setOverheadValues({}, true)
      setProfitValues({}, true)
      setIsSurfaceTreatmentAdded(false)
      if (newValue && newValue !== '' && newValue.value !== undefined && costData.CostingTypeId !== undefined) {
        setModelType(newValue)
        callModelAPI(newValue)

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
    if (IsIncludedToolCostInOverhead) {
      totalToolCost = checkForDecimalAndNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost, initialConfiguration?.NoOfDecimalForPrice)
    } else {
      totalToolCost = 0
    }
    if (!CostingViewMode) {
      const CutOffCost = checkForNull(CostingDataList && CostingDataList[0]?.RawMaterialCostWithCutOff)
      const IsCutOffApplicable = CostingDataList[0]?.IsRMCutOffApplicable;
      const OverheadDetail = OverheadProfitTabData[0]?.CostingPartDetails || {}

      // Process each applicability type
      dataObj?.CostingApplicabilityDetails?.forEach(detail => {
        const { Applicability, Percentage } = detail;

        switch (Applicability) {
          case 'Fixed':
            if (IsAPIResponse === false) {
              setValue('OverheadFixedPercentage', checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice) || '')
              setValue('OverheadFixedCost', '-')
              setValue('OverheadFixedTotalCost', checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice) || '')
            }
            break;
          case 'Part Cost':
          case 'RM':
            const rmCost = IsIncludeApplicabilityForChildParts ? checkForNull(OverheadDetail?.NetChildPartsRawMaterialsCost) : IsCutOffApplicable ? checkForNull(CutOffCost) : checkForNull(headerCosts?.NetRawMaterialsCost);
            const rmTotalCost = rmCost * calculatePercentage(Percentage);
            setValue(`Overhead${Applicability}Percentage`, checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Overhead${Applicability}Cost`, checkForDecimalAndNull(rmCost, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Overhead${Applicability}TotalCost`, checkForDecimalAndNull(rmTotalCost, initialConfiguration?.NoOfDecimalForPrice));
            break;

          case 'BOP':
            const bopCost = IsIncludeApplicabilityForChildParts ? (checkForNull(OverheadDetail?.NetChildPartsBoughtOutPartCost) + checkForNull(headerCosts?.NetBoughtOutPartCost)) : checkForNull(headerCosts?.NetBoughtOutPartCost);
            const bopTotalCost = bopCost * calculatePercentage(Percentage);
            setValue('OverheadBOPPercentage', checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice));
            setValue('OverheadBOPCost', checkForDecimalAndNull(bopCost, initialConfiguration?.NoOfDecimalForPrice));
            setValue('OverheadBOPTotalCost', checkForDecimalAndNull(bopTotalCost, initialConfiguration?.NoOfDecimalForPrice));
            break;

          case 'CC':
            const ccCost = IsIncludeApplicabilityForChildParts ? checkForNull(OverheadDetail?.NetChildPartsOperationCostForOverhead) + checkForNull(OverheadDetail?.NetChildPartsProcessCostForOverhead) + getCCCost('overhead') : getCCCost('overhead');
            const ccTotalCost = ccCost * calculatePercentage(Percentage);
            setValue('OverheadCCPercentage', checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice));
            setValue('OverheadCCCost', checkForDecimalAndNull(ccCost, initialConfiguration?.NoOfDecimalForPrice));
            setValue('OverheadCCTotalCost', checkForDecimalAndNull(ccTotalCost, initialConfiguration?.NoOfDecimalForPrice));
            break;

          case 'Welding':
            const weldingCost = IsIncludeApplicabilityForChildParts ? checkForNull(headerCosts?.NetWeldingCostForOverhead) + checkForNull(OverheadDetail?.NetChildPartsWeldingCostForOverhead) : checkForNull(headerCosts?.NetWeldingCostForOverhead);
            const weldingTotalCost = weldingCost * calculatePercentage(Percentage);
            setValue('OverheadWeldingPercentage', checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice));
            setValue('OverheadWeldingCost', checkForDecimalAndNull(weldingCost, initialConfiguration?.NoOfDecimalForPrice));
            setValue('OverheadWeldingTotalCost', checkForDecimalAndNull(weldingTotalCost, initialConfiguration?.NoOfDecimalForPrice));
            break;
          case 'BOP Domestic':
            const bopDomesticCost = IsIncludeApplicabilityForChildParts ? checkForNull(headerCosts?.NetBOPDomesticCost) + checkForNull(OverheadDetail?.NetChildPartsBOPDomesticCost) : checkForNull(headerCosts?.NetBOPDomesticCost);
            const bopDomesticTotalCost = bopDomesticCost * calculatePercentage(Percentage);
            setValue(`Overhead${Applicability}Percentage`, checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Overhead${Applicability}Cost`, checkForDecimalAndNull(bopDomesticCost, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Overhead${Applicability}TotalCost`, checkForDecimalAndNull(bopDomesticTotalCost, initialConfiguration?.NoOfDecimalForPrice));
            break;
          case 'BOP CKD':
            const bopCKDCost = IsIncludeApplicabilityForChildParts ? checkForNull(headerCosts?.NetBOPImportCost) + checkForNull(OverheadDetail?.NetChildPartsBOPImportCost) : checkForNull(headerCosts?.NetBOPImportCost);
            const bopCKDTotalCost = bopCKDCost * calculatePercentage(Percentage);
            setValue(`Overhead${Applicability}Percentage`, checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Overhead${Applicability}Cost`, checkForDecimalAndNull(bopCKDCost, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Overhead${Applicability}TotalCost`, checkForDecimalAndNull(bopCKDTotalCost, initialConfiguration?.NoOfDecimalForPrice));
            break;
          case 'BOP V2V':
            const bopV2VCost = IsIncludeApplicabilityForChildParts ? checkForNull(headerCosts?.NetBOPSourceCost) + checkForNull(OverheadDetail?.NetChildPartsBOPSourceCost) : checkForNull(headerCosts?.NetBOPSourceCost);
            const bopV2VTotalCost = bopV2VCost * calculatePercentage(Percentage);
            setValue(`Overhead${Applicability}Percentage`, checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Overhead${Applicability}Cost`, checkForDecimalAndNull(bopV2VCost, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Overhead${Applicability}TotalCost`, checkForDecimalAndNull(bopV2VTotalCost, initialConfiguration?.NoOfDecimalForPrice));
            break;
          case 'BOP OSP':
            const bopOSPCost = IsIncludeApplicabilityForChildParts ? checkForNull(headerCosts?.NetBOPOutsourcedCost) + checkForNull(OverheadDetail?.NetChildPartsBOPOutsourcedCost) : checkForNull(headerCosts?.NetBOPOutsourcedCost);
            const bopOSPTotalCost = bopOSPCost * calculatePercentage(Percentage);
            setValue(`Overhead${Applicability}Percentage`, checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Overhead${Applicability}Cost`, checkForDecimalAndNull(bopOSPCost, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Overhead${Applicability}TotalCost`, checkForDecimalAndNull(bopOSPTotalCost, initialConfiguration?.NoOfDecimalForPrice));
            break;
          case 'BOP Without Handling Charge':
            const bopCostWithoutHandling = IsIncludeApplicabilityForChildParts ? checkForNull(headerCosts?.NetBoughtOutPartCostWithOutHandlingCharge) + checkForNull(OverheadDetail?.NetChildPartsBoughtOutPartCostWithOutHandlingCharge) : checkForNull(headerCosts?.NetBoughtOutPartCostWithOutHandlingCharge);
            const bopTotalCostWithoutHandling = bopCostWithoutHandling * calculatePercentage(Percentage);
            setValue(`Overhead${Applicability}Percentage`, checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Overhead${Applicability}Cost`, checkForDecimalAndNull(bopCostWithoutHandling, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Overhead${Applicability}TotalCost`, checkForDecimalAndNull(bopTotalCostWithoutHandling, initialConfiguration?.NoOfDecimalForPrice));
            break;
          case 'BOP Domestic Without Handling Charge':
            const bopDomesticCostWithoutHandling = IsIncludeApplicabilityForChildParts ? checkForNull(headerCosts?.NetBOPDomesticCostWithOutHandlingCharge) + checkForNull(OverheadDetail?.NetChildPartsBOPDomesticCostWithOutHandlingCharge) : checkForNull(headerCosts?.NetBOPDomesticCostWithOutHandlingCharge);
            const bopDomesticTotalCostWithoutHandling = bopDomesticCostWithoutHandling * calculatePercentage(Percentage);
            setValue(`Overhead${Applicability}Percentage`, checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Overhead${Applicability}Cost`, checkForDecimalAndNull(bopDomesticCostWithoutHandling, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Overhead${Applicability}TotalCost`, checkForDecimalAndNull(bopDomesticTotalCostWithoutHandling, initialConfiguration?.NoOfDecimalForPrice));
            break;
          case 'BOP CKD Without Handling Charge':
            const bopCKDCostWithoutHandling = IsIncludeApplicabilityForChildParts ? checkForNull(headerCosts?.NetBOPImportCostWithOutHandlingCharge) + checkForNull(OverheadDetail?.NetChildPartsBOPImportCostWithOutHandlingCharge) : checkForNull(headerCosts?.NetBOPImportCostWithOutHandlingCharge);
            const bopCKDTotalCostWithoutHandling = bopCKDCostWithoutHandling * calculatePercentage(Percentage);
            setValue(`Overhead${Applicability}Percentage`, checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Overhead${Applicability}Cost`, checkForDecimalAndNull(bopCKDCostWithoutHandling, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Overhead${Applicability}TotalCost`, checkForDecimalAndNull(bopCKDTotalCostWithoutHandling, initialConfiguration?.NoOfDecimalForPrice));
            break;
          case 'BOP V2V Without Handling Charge':
            const bopV2VCostWithoutHandling = IsIncludeApplicabilityForChildParts ? checkForNull(headerCosts?.NetBOPSourceCostWithOutHandlingCharge) + checkForNull(OverheadDetail?.NetChildPartsBOPSourceCostWithOutHandlingCharge) : checkForNull(headerCosts?.NetBOPSourceCostWithOutHandlingCharge);
            const bopV2VTotalCostWithoutHandling = bopV2VCostWithoutHandling * calculatePercentage(Percentage);
            setValue(`Overhead${Applicability}Percentage`, checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Overhead${Applicability}Cost`, checkForDecimalAndNull(bopV2VCostWithoutHandling, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Overhead${Applicability}TotalCost`, checkForDecimalAndNull(bopV2VTotalCostWithoutHandling, initialConfiguration?.NoOfDecimalForPrice));
            break;
          case 'BOP OSP Without Handling Charge':
            const bopOSPCostWithoutHandling = IsIncludeApplicabilityForChildParts ? checkForNull(headerCosts?.NetBOPOutsourcedCostWithOutHandlingCharge) + checkForNull(OverheadDetail?.NetChildPartsBOPOutsourcedCostWithOutHandlingCharge) : checkForNull(headerCosts?.NetBOPOutsourcedCostWithOutHandlingCharge);
            const bopOSPTotalCostWithoutHandling = bopOSPCostWithoutHandling * calculatePercentage(Percentage);
            setValue(`Overhead${Applicability}Percentage`, checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Overhead${Applicability}Cost`, checkForDecimalAndNull(bopOSPCostWithoutHandling, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Overhead${Applicability}TotalCost`, checkForDecimalAndNull(bopOSPTotalCostWithoutHandling, initialConfiguration?.NoOfDecimalForPrice));
            break;
          default:
            break;
        }
      });

      // Update tempOverheadObj with CostingApplicabilityDetails
      const costingApplicabilityDetails = dataObj?.CostingApplicabilityDetails?.map(detail => {
        const { Applicability, Percentage, ApplicabilityDetailsId, ApplicabilityId } = detail;

        let baseCost = 0;
        if (Applicability === 'RM' || Applicability === 'Part Cost') {
          baseCost = IsIncludeApplicabilityForChildParts
            ? checkForNull(OverheadDetail?.NetChildPartsRawMaterialsCost)
            : IsCutOffApplicable
              ? checkForNull(CutOffCost)
              : checkForNull(headerCosts?.NetRawMaterialsCost);
        } else if (Applicability === 'BOP') {
          baseCost = IsIncludeApplicabilityForChildParts
            ? checkForNull(OverheadDetail?.NetChildPartsBoughtOutPartCost) + checkForNull(headerCosts?.NetBoughtOutPartCost)
            : checkForNull(headerCosts?.NetBoughtOutPartCost);
        } else if (Applicability === 'BOP Domestic') {
          baseCost = IsIncludeApplicabilityForChildParts
            ? checkForNull(OverheadDetail?.NetChildPartsBOPDomesticCost) + checkForNull(headerCosts?.NetBOPDomesticCost)
            : checkForNull(headerCosts?.NetBOPDomesticCost);
        } else if (Applicability === 'BOP CKD') {
          baseCost = IsIncludeApplicabilityForChildParts
            ? checkForNull(OverheadDetail?.NetChildPartsBOPImportCost) + checkForNull(headerCosts?.NetBOPImportCost)
            : checkForNull(headerCosts?.NetBOPImportCost);
        } else if (Applicability === 'BOP V2V') {
          baseCost = IsIncludeApplicabilityForChildParts
            ? checkForNull(OverheadDetail?.NetChildPartsBOPSourceCost) + checkForNull(headerCosts?.NetBOPSourceCost)
            : checkForNull(headerCosts?.NetBOPSourceCost);
        } else if (Applicability === 'BOP OSP') {
          baseCost = IsIncludeApplicabilityForChildParts
            ? checkForNull(OverheadDetail?.NetChildPartsBOPOutsourcedCost) + checkForNull(headerCosts?.NetBOPOutsourcedCost)
            : checkForNull(headerCosts?.NetBOPOutsourcedCost);
        } else if (Applicability === 'CC') {
          baseCost = IsIncludeApplicabilityForChildParts
            ? checkForNull(OverheadDetail?.NetChildPartsOperationCostForOverhead) + checkForNull(OverheadDetail?.NetChildPartsProcessCostForOverhead) + getCCCost('overhead')
            : getCCCost('overhead');

        } else if (Applicability === 'Welding') {
          baseCost = IsIncludeApplicabilityForChildParts
            ? checkForNull(headerCosts?.NetWeldingCostForOverhead) + checkForNull(OverheadDetail?.NetChildPartsWeldingCostForOverhead)
            : checkForNull(headerCosts?.NetWeldingCostForOverhead);
        } else if (Applicability === 'BOP Without Handling Charge') {
          baseCost = IsIncludeApplicabilityForChildParts
            ? checkForNull(headerCosts?.NetBoughtOutPartCostWithOutHandlingCharge) + checkForNull(OverheadDetail?.NetChildPartsBoughtOutPartCostWithOutHandlingCharge)
            : checkForNull(headerCosts?.NetBoughtOutPartCostWithOutHandlingCharge);
        } else if (Applicability === 'BOP Domestic Without Handling Charge') {
          baseCost = IsIncludeApplicabilityForChildParts
            ? checkForNull(headerCosts?.NetBOPDomesticCostWithOutHandlingCharge) + checkForNull(OverheadDetail?.NetChildPartsBOPDomesticCostWithOutHandlingCharge)
            : checkForNull(headerCosts?.NetBOPDomesticCostWithOutHandlingCharge);
        } else if (Applicability === 'BOP CKD Without Handling Charge') {
          baseCost = IsIncludeApplicabilityForChildParts
            ? checkForNull(headerCosts?.NetBOPImportCostWithOutHandlingCharge) + checkForNull(OverheadDetail?.NetChildPartsBOPImportCostWithOutHandlingCharge)
            : checkForNull(headerCosts?.NetBOPImportCostWithOutHandlingCharge);
        } else if (Applicability === 'BOP V2V Without Handling Charge') {
          baseCost = IsIncludeApplicabilityForChildParts
            ? checkForNull(headerCosts?.NetBOPSourceCostWithOutHandlingCharge) + checkForNull(OverheadDetail?.NetChildPartsBOPSourceCostWithOutHandlingCharge)
            : checkForNull(headerCosts?.NetBOPSourceCostWithOutHandlingCharge);
        } else if (Applicability === 'BOP OSP Without Handling Charge') {
          baseCost = IsIncludeApplicabilityForChildParts
            ? checkForNull(headerCosts?.NetBOPOutsourcedCostWithOutHandlingCharge) + checkForNull(OverheadDetail?.NetChildPartsBOPOutsourcedCostWithOutHandlingCharge)
            : checkForNull(headerCosts?.NetBOPOutsourcedCostWithOutHandlingCharge);
        } else {
          baseCost = 0;
        }

        const totalCost = baseCost * calculatePercentage(Percentage);
        return {
          ApplicabilityDetailsId: ApplicabilityDetailsId,
          ApplicabilityId: ApplicabilityId,
          Applicability: Applicability,
          Percentage: Percentage,
          Cost: baseCost,
          TotalCost: totalCost
        };
      });

      setOverheadObj({
        ...overheadObj,
        CostingApplicabilityDetails: costingApplicabilityDetails
      });
    }
  }

  /**
  * @method setProfitValues
  * @description  SET PROFIT VALUES IN FIXED, COMBINED, RM, CC AND FIXED
  */
  const setProfitValues = (dataObj, IsAPIResponse) => {

    if (!CostingViewMode) {
      const CutOffCost = checkForNull(CostingDataList && CostingDataList[0]?.RawMaterialCostWithCutOff)
      const IsCutOffApplicable = CostingDataList[0]?.IsRMCutOffApplicable;
      const ProfitDetail = OverheadProfitTabData[0]?.CostingPartDetails ?? {}
      // Process each applicability type
      dataObj?.CostingApplicabilityDetails?.forEach(detail => {
        const { Applicability, Percentage, Cost, TotalCost } = detail;

        switch (Applicability) {
          case 'Fixed':
            if (IsAPIResponse === false) {
              setValue('ProfitFixedPercentage', checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice) || '')
              setValue('ProfitFixedCost', '-')
              setValue('ProfitFixedTotalCost', checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice) || '')
            }
            break;
          case 'RM':
          case 'Part Cost':
            const rmCost = IsIncludeApplicabilityForChildParts ? checkForNull(ProfitDetail?.NetChildPartsRawMaterialsCost) : checkForNull(headerCosts?.NetRawMaterialsCost);
            const rmTotalCost = rmCost * calculatePercentage(Percentage);
            setValue(`Profit${Applicability}Percentage`, checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Profit${Applicability}Cost`, checkForDecimalAndNull(rmCost, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Profit${Applicability}TotalCost`, checkForDecimalAndNull(rmTotalCost, initialConfiguration?.NoOfDecimalForPrice));
            break;

          case 'BOP':
            const bopCost = IsIncludeApplicabilityForChildParts ? checkForNull(headerCosts?.NetBoughtOutPartCost) + checkForNull(ProfitDetail?.NetChildPartsBoughtOutPartCost) : checkForNull(headerCosts?.NetBoughtOutPartCost);
            const bopTotalCost = bopCost * calculatePercentage(Percentage);
            setValue('ProfitBOPPercentage', checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice));
            setValue('ProfitBOPCost', checkForDecimalAndNull(bopCost, initialConfiguration?.NoOfDecimalForPrice));
            setValue('ProfitBOPTotalCost', checkForDecimalAndNull(bopTotalCost, initialConfiguration?.NoOfDecimalForPrice));
            break;

          case 'CC':
            const ccCost = IsIncludeApplicabilityForChildParts ? getCCCost('profit') + checkForNull(ProfitDetail?.NetChildPartsOperationCostForProfit) + checkForNull(ProfitDetail?.NetChildPartsProcessCostForProfit) : getCCCost('profit');
            const ccTotalCost = ccCost * calculatePercentage(Percentage);
            setValue('ProfitCCPercentage', checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice));
            setValue('ProfitCCCost', checkForDecimalAndNull(ccCost, initialConfiguration?.NoOfDecimalForPrice));
            setValue('ProfitCCTotalCost', checkForDecimalAndNull(ccTotalCost, initialConfiguration?.NoOfDecimalForPrice));
            break;

          case 'Welding':
            const weldingCost = IsIncludeApplicabilityForChildParts ?
              checkForNull(headerCosts?.NetWeldingCostForProfit) + checkForNull(ProfitDetail?.NetChildPartsWeldingCostForProfit) :
              checkForNull(headerCosts?.NetWeldingCostForProfit);
            const weldingTotalCost = weldingCost * calculatePercentage(Percentage);
            setValue('ProfitWeldingPercentage', checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice));
            setValue('ProfitWeldingCost', checkForDecimalAndNull(weldingCost, initialConfiguration?.NoOfDecimalForPrice));
            setValue('ProfitWeldingTotalCost', checkForDecimalAndNull(weldingTotalCost, initialConfiguration?.NoOfDecimalForPrice));
            break;
          case 'BOP Domestic':
            const bopDomesticCost = IsIncludeApplicabilityForChildParts ? checkForNull(headerCosts?.NetBOPDomesticCost) + checkForNull(ProfitDetail?.NetChildPartsBOPDomesticCost) : checkForNull(headerCosts?.NetBOPDomesticCost);
            const bopDomesticTotalCost = bopDomesticCost * calculatePercentage(Percentage);
            setValue(`Profit${Applicability}Percentage`, checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Profit${Applicability}Cost`, checkForDecimalAndNull(bopDomesticCost, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Profit${Applicability}TotalCost`, checkForDecimalAndNull(bopDomesticTotalCost, initialConfiguration?.NoOfDecimalForPrice));
            break;
          case 'BOP CKD':
            const bopCKDCost = IsIncludeApplicabilityForChildParts ? checkForNull(headerCosts?.NetBOPImportCost) + checkForNull(ProfitDetail?.NetChildPartsBOPImportCost) : checkForNull(headerCosts?.NetBOPImportCost);
            const bopCKDTotalCost = bopCKDCost * calculatePercentage(Percentage);
            setValue(`Profit${Applicability}Percentage`, checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Profit${Applicability}Cost`, checkForDecimalAndNull(bopCKDCost, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Profit${Applicability}TotalCost`, checkForDecimalAndNull(bopCKDTotalCost, initialConfiguration?.NoOfDecimalForPrice));
            break;
          case 'BOP V2V':
            const bopV2VCost = IsIncludeApplicabilityForChildParts ? checkForNull(headerCosts?.NetBOPSourceCost) + checkForNull(ProfitDetail?.NetChildPartsBOPSourceCost) : checkForNull(headerCosts?.NetBOPSourceCost);
            const bopV2VTotalCost = bopV2VCost * calculatePercentage(Percentage);
            setValue(`Profit${Applicability}Percentage`, checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Profit${Applicability}Cost`, checkForDecimalAndNull(bopV2VCost, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Profit${Applicability}TotalCost`, checkForDecimalAndNull(bopV2VTotalCost, initialConfiguration?.NoOfDecimalForPrice));
            break;
          case 'BOP OSP':
            const bopOSPCost = IsIncludeApplicabilityForChildParts ? checkForNull(headerCosts?.NetBOPOutsourcedCost) + checkForNull(ProfitDetail?.NetChildPartsBOPOutsourcedCost) : checkForNull(headerCosts?.NetBOPOutsourcedCost);
            const bopOSPTotalCost = bopOSPCost * calculatePercentage(Percentage);
            setValue(`Profit${Applicability}Percentage`, checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Profit${Applicability}Cost`, checkForDecimalAndNull(bopOSPCost, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Profit${Applicability}TotalCost`, checkForDecimalAndNull(bopOSPTotalCost, initialConfiguration?.NoOfDecimalForPrice));
            break;
          case 'BOP Without Handling Charge':
            const bopCostWithoutHandling = IsIncludeApplicabilityForChildParts ? checkForNull(headerCosts?.NetBoughtOutPartCostWithOutHandlingCharge) + checkForNull(ProfitDetail?.NetChildPartsBoughtOutPartCostWithOutHandlingCharge) : checkForNull(headerCosts?.NetBoughtOutPartCostWithOutHandlingCharge);
            const bopTotalCostWithoutHandling = bopCostWithoutHandling * calculatePercentage(Percentage);
            setValue(`Profit${Applicability}Percentage`, checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Profit${Applicability}Cost`, checkForDecimalAndNull(bopCostWithoutHandling, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Profit${Applicability}TotalCost`, checkForDecimalAndNull(bopTotalCostWithoutHandling, initialConfiguration?.NoOfDecimalForPrice));
            break;
          case 'BOP Domestic Without Handling Charge':
            const bopDomesticCostWithoutHandling = IsIncludeApplicabilityForChildParts ? checkForNull(headerCosts?.NetBOPDomesticCostWithOutHandlingCharge) + checkForNull(ProfitDetail?.NetChildPartsBOPDomesticCostWithOutHandlingCharge) : checkForNull(headerCosts?.NetBOPDomesticCostWithOutHandlingCharge);
            const bopDomesticTotalCostWithoutHandling = bopDomesticCostWithoutHandling * calculatePercentage(Percentage);
            setValue(`Profit${Applicability}Percentage`, checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Profit${Applicability}Cost`, checkForDecimalAndNull(bopDomesticCostWithoutHandling, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Profit${Applicability}TotalCost`, checkForDecimalAndNull(bopDomesticTotalCostWithoutHandling, initialConfiguration?.NoOfDecimalForPrice));
            break;
          case 'BOP CKD Without Handling Charge':
            const bopCKDCostWithoutHandling = IsIncludeApplicabilityForChildParts ? checkForNull(headerCosts?.NetBOPImportCostWithOutHandlingCharge) + checkForNull(ProfitDetail?.NetChildPartsBOPImportCostWithOutHandlingCharge) : checkForNull(headerCosts?.NetBOPImportCostWithOutHandlingCharge);
            const bopCKDTotalCostWithoutHandling = bopCKDCostWithoutHandling * calculatePercentage(Percentage);
            setValue(`Profit${Applicability}Percentage`, checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Profit${Applicability}Cost`, checkForDecimalAndNull(bopCKDCostWithoutHandling, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Profit${Applicability}TotalCost`, checkForDecimalAndNull(bopCKDTotalCostWithoutHandling, initialConfiguration?.NoOfDecimalForPrice));
            break;
          case 'BOP V2V Without Handling Charge':
            const bopV2VCostWithoutHandling = IsIncludeApplicabilityForChildParts ? checkForNull(headerCosts?.NetBOPSourceCostWithOutHandlingCharge) + checkForNull(ProfitDetail?.NetChildPartsBOPSourceCostWithOutHandlingCharge) : checkForNull(headerCosts?.NetBOPSourceCostWithOutHandlingCharge);
            const bopV2VTotalCostWithoutHandling = bopV2VCostWithoutHandling * calculatePercentage(Percentage);
            setValue(`Profit${Applicability}Percentage`, checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Profit${Applicability}Cost`, checkForDecimalAndNull(bopV2VCostWithoutHandling, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Profit${Applicability}TotalCost`, checkForDecimalAndNull(bopV2VTotalCostWithoutHandling, initialConfiguration?.NoOfDecimalForPrice));
            break;
          case 'BOP OSP Without Handling Charge':
            const bopOSPCostWithoutHandling = IsIncludeApplicabilityForChildParts ? checkForNull(headerCosts?.NetBOPOutsourcedCostWithOutHandlingCharge) + checkForNull(ProfitDetail?.NetChildPartsBOPOutsourcedCostWithOutHandlingCharge) : checkForNull(headerCosts?.NetBOPOutsourcedCostWithOutHandlingCharge);
            const bopOSPTotalCostWithoutHandling = bopOSPCostWithoutHandling * calculatePercentage(Percentage);
            setValue(`Profit${Applicability}Percentage`, checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Profit${Applicability}Cost`, checkForDecimalAndNull(bopOSPCostWithoutHandling, initialConfiguration?.NoOfDecimalForPrice));
            setValue(`Profit${Applicability}TotalCost`, checkForDecimalAndNull(bopOSPTotalCostWithoutHandling, initialConfiguration?.NoOfDecimalForPrice));
            break;
          default:
            break;
        }
      });

      const costingApplicabilityDetailsProfit = dataObj?.CostingApplicabilityDetails?.map(detail => {

        const { Applicability, Percentage, ApplicabilityDetailsId, ApplicabilityId } = detail;
        let baseCost = 0;
        if (Applicability === 'RM' || Applicability === 'Part Cost') {
          baseCost = IsIncludeApplicabilityForChildParts
            ? checkForNull(ProfitDetail?.NetChildPartsRawMaterialsCost)
            : IsCutOffApplicable
              ? checkForNull(CutOffCost)
              : checkForNull(headerCosts?.NetRawMaterialsCost);
        } else if (Applicability === 'BOP') {
          baseCost = IsIncludeApplicabilityForChildParts
            ? checkForNull(headerCosts?.NetBoughtOutPartCost) + checkForNull(ProfitDetail?.NetChildPartsBoughtOutPartCost)
            : checkForNull(headerCosts?.NetBoughtOutPartCost);
        } else if (Applicability === 'CC') {
          baseCost = IsIncludeApplicabilityForChildParts
            ? getCCCost('profit') + checkForNull(ProfitDetail?.NetChildPartsOperationCostForProfit) + checkForNull(ProfitDetail?.NetChildPartsProcessCostForProfit)
            : getCCCost('profit');
        } else if (Applicability === 'Welding') {
          baseCost = IsIncludeApplicabilityForChildParts
            ? checkForNull(headerCosts?.NetWeldingCostForProfit) + checkForNull(ProfitDetail?.NetChildPartsWeldingCostForProfit)
            : checkForNull(headerCosts?.NetWeldingCostForProfit);
        } else if (Applicability === 'BOP Domestic')  {
          baseCost = IsIncludeApplicabilityForChildParts
            ? checkForNull(headerCosts?.NetBOPDomesticCost) + checkForNull(ProfitDetail?.NetChildPartsBOPDomesticCost)
            : checkForNull(headerCosts?.NetBOPDomesticCost);
        } else if (Applicability === 'BOP CKD') {
          baseCost = IsIncludeApplicabilityForChildParts
            ? checkForNull(headerCosts?.NetBOPImportCost) + checkForNull(ProfitDetail?.NetChildPartsBOPImportCost)
            : checkForNull(headerCosts?.NetBOPImportCost);
        } else if (Applicability === 'BOP V2V') {
          baseCost = IsIncludeApplicabilityForChildParts
            ? checkForNull(headerCosts?.NetBOPSourceCost) + checkForNull(ProfitDetail?.NetChildPartsBOPSourceCost)
            : checkForNull(headerCosts?.NetBOPSourceCost);
        } else if (Applicability === 'BOP OSP') {
          baseCost = IsIncludeApplicabilityForChildParts
            ? checkForNull(headerCosts?.NetBOPOutsourcedCost) + checkForNull(ProfitDetail?.NetChildPartsBOPOutsourcedCost)
            : checkForNull(headerCosts?.NetBOPOutsourcedCost);
        } else if (Applicability === 'BOP Without Handling Charge') {
          baseCost = IsIncludeApplicabilityForChildParts
            ? checkForNull(headerCosts?.NetBoughtOutPartCostWithOutHandlingCharge) + checkForNull(ProfitDetail?.NetChildPartsBoughtOutPartCostWithOutHandlingCharge)
            : checkForNull(headerCosts?.NetBoughtOutPartCostWithOutHandlingCharge);
        } else if (Applicability === 'BOP Domestic Without Handling Charge') {
          baseCost = IsIncludeApplicabilityForChildParts
            ? checkForNull(headerCosts?.NetBOPDomesticCostWithOutHandlingCharge) + checkForNull(ProfitDetail?.NetChildPartsBOPDomesticCostWithOutHandlingCharge)
            : checkForNull(headerCosts?.NetBOPDomesticCostWithOutHandlingCharge);
        } else if (Applicability === 'BOP CKD Without Handling Charge') {
          baseCost = IsIncludeApplicabilityForChildParts
            ? checkForNull(headerCosts?.NetBOPImportCostWithOutHandlingCharge) + checkForNull(ProfitDetail?.NetChildPartsBOPImportCostWithOutHandlingCharge)
            : checkForNull(headerCosts?.NetBOPImportCostWithOutHandlingCharge);
        } else if (Applicability === 'BOP V2V Without Handling Charge') {
          baseCost = IsIncludeApplicabilityForChildParts
            ? checkForNull(headerCosts?.NetBOPSourceCostWithOutHandlingCharge) + checkForNull(ProfitDetail?.NetChildPartsBOPSourceCostWithOutHandlingCharge)
            : checkForNull(headerCosts?.NetBOPSourceCostWithOutHandlingCharge);
        } else if (Applicability === 'BOP OSP Without Handling Charge	') {
          baseCost = IsIncludeApplicabilityForChildParts
            ? checkForNull(headerCosts?.NetBOPOutsourcedCostWithOutHandlingCharge) + checkForNull(ProfitDetail?.NetChildPartsBOPOutsourcedCostWithOutHandlingCharge)
            : checkForNull(headerCosts?.NetBOPOutsourcedCostWithOutHandlingCharge);
        }
        const totalCost = baseCost * calculatePercentage(Percentage);

        return {
          ApplicabilityDetailsId: ApplicabilityDetailsId,
          ApplicabilityId: ApplicabilityId,
          Applicability: Applicability,
          Percentage: Percentage,
          Cost: baseCost,
          TotalCost: totalCost
        };
      });

      setProfitObj({
        ...profitObj,
        CostingApplicabilityDetails: costingApplicabilityDetailsProfit
      });
    }
  }
  /**
  * @method getCCCost
  * @description Get CC cost based on type (overhead/profit)
  */
  const getCCCost = (type = '') => {
    const NetSurfaceTreatmentCost = SurfaceTreatmentCost && SurfaceTreatmentCost?.NetSurfaceTreatmentCost !== undefined ? checkForNull(SurfaceTreatmentCost?.NetSurfaceTreatmentCost) : checkForNull(CostingDataList[0]?.NetSurfaceTreatmentCost);
    const NetToolCost = state.isIncludeToolCostInOverhead || state.isIncludeToolCostInProfit ? checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) : 0;

    if (type === 'overhead') {
      return checkForNull(headerCosts?.NetProcessCostForOverhead) +
        checkForNull(headerCosts?.NetOperationCostForOverhead) +
        (state.isIncludeToolCostInOverhead ? checkForNull(NetToolCost) : 0) +
        (state.isIncludeSurfaceTreatmentInOverhead ? checkForNull(NetSurfaceTreatmentCost) : 0);
    } else if (type === 'profit') {
      return checkForNull(headerCosts?.NetProcessCostForProfit) +
        checkForNull(headerCosts?.NetOperationCostForProfit) +
        (state.isIncludeToolCostInProfit ? checkForNull(NetToolCost) : 0) +
        (state.isIncludeSurfaceTreatmentInProfit ? checkForNull(NetSurfaceTreatmentCost) : 0);
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
    // Add profit remarks to the values before saving
    values.profitRemark = profitObj?.Remark || '';
    values.overHeadRemark = overheadObj?.Remark || '';
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

    if (errors.overheadRemark !== undefined) {
      return false
    }

    const remarkValue = getValues('overheadRemark');
    setOverheadObj(prev => ({
      ...prev,
      Remark: remarkValue
    }));

    if (remarkValue) {
      Toaster.success('Remark saved successfully')
    }
    var button = document.getElementById(`popUpTriggerOverhead`)
    button.click()
  }

  const onRemarkPopUpCloseOverHead = () => {
    let button = document.getElementById(`popUpTriggerOverhead`)
    setValue(`overheadRemark`, overheadObj?.Remark || '')
    if (errors.overheadRemark) {
      delete errors.overheadRemark;
    }
    button.click()
  }

  const onRemarkPopUpClickProfit = () => {
    if (errors.profitRemark !== undefined) {
      return false
    }

    const remarkValue = getValues('profitRemark');
    setProfitObj(prev => ({
      ...prev,
      Remark: remarkValue
    }));

    if (remarkValue) {
      Toaster.success('Remark saved successfully')
    }
    var button = document.getElementById(`popUpTriggerProfit`)
    button.click()
  }

  const onRemarkPopUpCloseProfit = () => {
    let button = document.getElementById(`popUpTriggerProfit`)
    setValue(`profitRemark`, profitObj?.Remark || '')
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
          detail.ApplicabilityDetailsId === item?.ApplicabilityDetailsId
            ? { ...detail, Cost: checkForNull(value), TotalCost: checkForNull(value) }
            : detail
        )
      }));
    } else {
      setProfitObj(prev => ({
        ...prev,
        CostingApplicabilityDetails: prev?.CostingApplicabilityDetails.map(detail =>
          detail.ApplicabilityDetailsId === item?.ApplicabilityDetailsId
            ? { ...detail, Cost: checkForNull(value), TotalCost: checkForNull(value) }
            : detail
        )
      }));
    }
  };
  const onPressIncludeSurfaceTreatmentOverhead = () => {
    setState(prev => ({
      ...prev,
      isIncludeSurfaceTreatmentInOverhead: !prev.isIncludeSurfaceTreatmentInOverhead,
      isPressSurfaceOverhead: true
    }))
    dispatch(setSurfaceCostInOverhead(!IsIncludedSurfaceInOverhead))
    dispatch(isOverheadProfitDataChange(true))
  }

  const onPressIncludeSurfaceTreatmentProfit = () => {
    setState(prev => ({
      ...prev,
      isIncludeSurfaceTreatmentInProfit: !prev.isIncludeSurfaceTreatmentInProfit,
      isPressSurfaceProfit: true
    }))
    dispatch(setSurfaceCostInProfit(!IsIncludedSurfaceInProfit))
    dispatch(isOverheadProfitDataChange(true))
  }
  const onPressIncludeToolCostOverhead = () => {
    setState(prev => ({
      ...prev,
      isIncludeToolCostInOverhead: !prev.isIncludeToolCostInOverhead,
      isPressToolOverhead: true
    }))
    dispatch(setToolCostInOverhead(!IsIncludedToolCostInOverhead))
    dispatch(isOverheadProfitDataChange(true))
  }

  const onPressIncludeToolCostProfit = () => {
    setState(prev => ({
      ...prev,
      isIncludeToolCostInProfit: !prev.isIncludeToolCostInProfit,
      isPressToolProfit: true
    }))
    dispatch(setToolCostInProfit(!IsIncludedToolCostInProfit))
    dispatch(isOverheadProfitDataChange(true))
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
              <Col md="12" className="py-3 overhead-profit-tab">
                <label
                  id="Overhead_profit_checkbox1"
                  className={`custom-checkbox mb-0 w-fit-content`}
                  onChange={onPressIncludeSurfaceTreatmentOverhead}
                >
                  Include Surface Treatment Cost in CC for Overhead
                  <input
                    type="checkbox"
                    checked={state.isIncludeSurfaceTreatmentInOverhead}
                    disabled={(CostingViewMode || (OverheadProfitTabData && OverheadProfitTabData[0]?.IsOpen === false)) ? true : false}
                  />
                  <span
                    className=" before-box"
                    checked={state.isIncludeSurfaceTreatmentInOverhead}
                    onChange={onPressIncludeSurfaceTreatmentOverhead}
                  />
                </label>
                <label
                  id="Overhead_profit_checkbox1"
                  className={`custom-checkbox mb-0 w-fit-content`}
                  onChange={onPressIncludeSurfaceTreatmentProfit}
                >
                  Include Surface Treatment Cost in CC for Profit
                  <input
                    type="checkbox"
                    checked={state.isIncludeSurfaceTreatmentInProfit}
                    disabled={(CostingViewMode || (OverheadProfitTabData && OverheadProfitTabData[0]?.IsOpen === false)) ? true : false}
                  />
                  <span
                    className=" before-box"
                    checked={state.isIncludeSurfaceTreatmentInProfit}
                    onChange={onPressIncludeSurfaceTreatmentProfit}
                  />
                </label>
                <label
                  id="Overhead_profit_checkbox3"
                  className={`custom-checkbox mb-0 w-fit-content`}
                  onChange={onPressIncludeToolCostOverhead}
                >
                  Include Tool cost in CC for Overhead
                  <input
                    type="checkbox"
                    checked={state.isIncludeToolCostInOverhead}
                    disabled={(CostingViewMode || (OverheadProfitTabData && OverheadProfitTabData[0]?.IsOpen === false)) ? true : false}
                  />
                  <span
                    className=" before-box"
                    checked={state.isIncludeToolCostInOverhead}
                    onChange={onPressIncludeToolCostOverhead}
                  />
                </label>
                <label
                  id="Overhead_profit_checkbox3"
                  className={`custom-checkbox mb-0 w-fit-content`}
                  onChange={onPressIncludeToolCostProfit}
                >
                  Include Tool cost in CC for Profit
                  <input
                    type="checkbox"
                    checked={state.isIncludeToolCostInProfit}
                    disabled={(CostingViewMode || (OverheadProfitTabData && OverheadProfitTabData[0]?.IsOpen === false)) ? true : false}
                  />
                  <span
                    className=" before-box"
                    checked={state.isIncludeToolCostInProfit}
                    onChange={onPressIncludeToolCostProfit}
                  />
                </label>
              </Col>
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
                  {`Overheads ${overheadObj && overheadObj?.OverheadApplicability ? '(' + overheadObj?.OverheadApplicability + ')' : '-'}`}
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

              {/* {
                overheadObj  &&
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
                        validateWithRemarkValidation={true}
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
              } */}
              <OverheadProfitTable
                data={{
                  ...overheadObj,
                  CostingApplicabilityDetails: (partType) ?
                    filterApplicabilityDetails(overheadObj?.CostingApplicabilityDetails, IsIncludeApplicabilityForChildParts) :
                    overheadObj?.CostingApplicabilityDetails
                }}
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
                onRemarkPopUpClick={onRemarkPopUpClickOverHead}
                onRemarkPopUpClose={onRemarkPopUpCloseOverHead}
              />


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
              <OverheadProfitTable

                data={{
                  ...profitObj,
                  CostingApplicabilityDetails: (partType) ?
                    filterApplicabilityDetails(profitObj?.CostingApplicabilityDetails, IsIncludeApplicabilityForChildParts) :
                    profitObj?.CostingApplicabilityDetails
                }}
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
                onRemarkPopUpClick={onRemarkPopUpClickProfit}
                onRemarkPopUpClose={onRemarkPopUpCloseProfit}
              />
              {/* {
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
                        validateWithRemarkValidation={true}
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
              } */}

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

            {/* <Icc
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
            /> */}
            <Row className=" no-gutters justify-content-between btn-sticky-container overhead-profit-save-btn">
              <div className="col-sm-12 text-right bluefooter-butn ">
                <WarningMessage message={'When you make any changes in RM + CC, Surface Treatment, or Tool Cost, you need to save the updated values.'} />
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
