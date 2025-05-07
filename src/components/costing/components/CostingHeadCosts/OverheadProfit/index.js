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
  const [showWarning, setShowWarning] = useState('')
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
    if (CostingOverheadDetail && (CostingOverheadDetail)?.length > 0) {
      setOverheadValues(CostingOverheadDetail, false)
    }

    //GET FIXED VALUE IN GET API
    if (CostingProfitDetail && (CostingProfitDetail)?.length > 0) {
      setProfitValues(CostingProfitDetail, false)
      setValue('crmHeadProfit', CostingProfitDetail && CostingProfitDetail.ProfitCRMHead && {
        label: CostingProfitDetail.ProfitCRMHead, value: 1
      })
      setValue('profitremark', CostingProfitDetail && CostingProfitDetail.Remark ? CostingProfitDetail.Remark : '')
    }
  }, []);


  useEffect(() => {
    setOverheadValues(overheadObj, false)
    setProfitValues(profitObj, false)
    setIsSurfaceTreatmentAdded(false)
  }, [IsIncludedSurfaceInOverheadProfit, IsIncludedToolCost,SurfaceTreatmentCost.NetSurfaceTreatmentCost])

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
        "OverheadDetailId": overheadObj?.OverheadDetailId || "00000000-0000-0000-0000-000000000000",
        "OverheadId": overheadObj?.OverheadId || "00000000-0000-0000-0000-000000000000", 
        "OverheadCRMHead": overheadObj?.OverheadCRMHead || "",
        "Remark": overheadObj?.Remark || "",
        "CostingApplicabilityDetails": tempOverheadObj?.CostingApplicabilityDetails || []
      }
      let profitTempObj = {
        "ProfitDetailId": profitObj?.ProfitDetailId || "00000000-0000-0000-0000-000000000000",
        "ProfitId": profitObj?.ProfitId || "00000000-0000-0000-0000-000000000000",
        "ProfitCRMHead": profitObj?.ProfitCRMHead || "",
        "Remark": profitObj?.Remark || "",
        "CostingApplicabilityDetails": tempProfitObj?.CostingApplicabilityDetails || []
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
      const CutOffCost = checkForNull(CostingDataList && CostingDataList[0]?.RawMaterialCostWithCutOff)
      const IsCutOffApplicable = CostingDataList[0]?.IsRMCutOffApplicable;

      // Process each applicability type
      dataObj?.CostingApplicabilityDetails?.forEach(detail => {
        const { Applicability, Percentage} = detail;

        switch (Applicability) {
          case 'Fixed':
            if (IsAPIResponse === false) {
              setValue('OverheadFixedPercentage', checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice) || '')
              setValue('OverheadFixedCost', '-')
              setValue('OverheadFixedTotalCost', checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice) || '')
            }
            break;
          case 'RM':
            const rmCost = IsCutOffApplicable ? checkForNull(CutOffCost) : checkForNull(headerCosts?.NetRawMaterialsCost)
            const rmTotalCost = rmCost * calculatePercentage(Percentage)
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

          case 'Welding':
            console.log(headerCosts?.NetWeldingCostForOverhead, 'headerCosts?.NetWeldingCostForOverhead')
            console.log(headerCosts, 'headerCosts')
            const weldingCost = checkForNull(headerCosts?.NetWeldingCostForOverhead)
            const weldingTotalCost = weldingCost * calculatePercentage(Percentage)

            setValue('OverheadWeldingPercentage', checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice))
            setValue('OverheadWeldingCost', checkForDecimalAndNull(weldingCost, initialConfiguration?.NoOfDecimalForPrice))
            setValue('OverheadWeldingTotalCost', checkForDecimalAndNull(weldingTotalCost, initialConfiguration?.NoOfDecimalForPrice))
            break;
          default:
            break;
        }
      });

      // Update tempOverheadObj with CostingApplicabilityDetails
      const costingApplicabilityDetails = dataObj?.CostingApplicabilityDetails?.map(detail => {
        const { Applicability, Percentage, ApplicabilityDetailsId, ApplicabilityId } = detail;
        const baseCost = Applicability === 'RM' ?
          (IsCutOffApplicable ? CutOffCost : headerCosts?.NetRawMaterialsCost) :
          Applicability === 'BOP' ? headerCosts?.NetBoughtOutPartCost :
            Applicability === 'CC' ? getCCCost('overhead') :
              Applicability === 'Welding' ? checkForNull(headerCosts?.NetWeldingCostForOverhead) : 0;

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
      
      setTempOverheadObj({
        ...tempOverheadObj,
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
            const rmCost = IsCutOffApplicable ? checkForNull(CutOffCost) : checkForNull(headerCosts?.NetRawMaterialsCost)
            const rmTotalCost = rmCost * calculatePercentage(Percentage)

            setValue('ProfitRMPercentage', checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice))
            setValue('ProfitRMCost', checkForDecimalAndNull(rmCost, initialConfiguration?.NoOfDecimalForPrice))
            setValue('ProfitRMTotalCost', checkForDecimalAndNull(rmTotalCost, initialConfiguration?.NoOfDecimalForPrice))
            break;

          case 'BOP':
            const bopCost = checkForNull(headerCosts?.NetBoughtOutPartCost)
            const bopTotalCost = bopCost * calculatePercentage(Percentage)

            setValue('ProfitBOPPercentage', checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice))
            setValue('ProfitBOPCost', checkForDecimalAndNull(bopCost, initialConfiguration?.NoOfDecimalForPrice))
            setValue('ProfitBOPTotalCost', checkForDecimalAndNull(bopTotalCost, initialConfiguration?.NoOfDecimalForPrice))
            break;

          case 'CC':
            const ccCost = getCCCost('profit')
            const ccTotalCost = ccCost * calculatePercentage(Percentage)

            setValue('ProfitCCPercentage', checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice))
            setValue('ProfitCCCost', checkForDecimalAndNull(ccCost, initialConfiguration?.NoOfDecimalForPrice))
            setValue('ProfitCCTotalCost', checkForDecimalAndNull(ccTotalCost, initialConfiguration?.NoOfDecimalForPrice))
            break;

          case 'Welding':
            const weldingCost = checkForNull(headerCosts?.NetWeldingCostForProfit)
            const weldingTotalCost = weldingCost * calculatePercentage(Percentage)

            setValue('ProfitWeldingPercentage', checkForDecimalAndNull(Percentage, initialConfiguration?.NoOfDecimalForPrice))
            setValue('ProfitWeldingCost', checkForDecimalAndNull(weldingCost, initialConfiguration?.NoOfDecimalForPrice))
            setValue('ProfitWeldingTotalCost', checkForDecimalAndNull(weldingTotalCost, initialConfiguration?.NoOfDecimalForPrice))
            break;
          default:
            break;
        }
      });

      // Update tempProfitObj with CostingApplicabilityDetails
      const costingApplicabilityDetails = dataObj?.CostingApplicabilityDetails?.map(detail => {
        const { Applicability, Percentage, ApplicabilityDetailsId, ApplicabilityId } = detail;
        const baseCost = Applicability === 'RM' ?
          (IsCutOffApplicable ? CutOffCost : headerCosts?.NetRawMaterialsCost) :
          Applicability === 'BOP' ? headerCosts?.NetBoughtOutPartCost :
            Applicability === 'CC' ? getCCCost('profit') : 0;

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

      setTempProfitObj({
        ...tempProfitObj,
        CostingApplicabilityDetails: costingApplicabilityDetails
      });
    }
  }
  /**
  * @method getCCCost
  * @description Get CC cost based on type (overhead/profit)
  */
  const getCCCost = (type = '') => {
    const NetSurfaceTreatmentCost = SurfaceTreatmentCost && SurfaceTreatmentCost?.NetSurfaceTreatmentCost !== undefined ? checkForNull(SurfaceTreatmentCost?.NetSurfaceTreatmentCost) : checkForNull(CostingDataList[0]?.NetSurfaceTreatmentCost);
    const NetToolCost = IsIncludedToolCost ? checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) : 0;
    if (type === 'overhead') {
      return checkForNull(headerCosts?.NetProcessCostForOverhead) + 
             checkForNull(headerCosts?.NetOperationCostForOverhead) + 
             (IsIncludedToolCost ? checkForNull(NetToolCost) : 0) + 
             (IsIncludedSurfaceInOverheadProfit ? checkForNull(NetSurfaceTreatmentCost) : 0);
    } else if (type === 'profit') {
      return checkForNull(headerCosts?.NetProcessCostForProfit) + 
      checkForNull(headerCosts?.NetOperationCostForProfit) + 
      (IsIncludedToolCost ? checkForNull(NetToolCost) : 0) + 
      (IsIncludedSurfaceInOverheadProfit ? checkForNull(NetSurfaceTreatmentCost) : 0);
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

    if (errors.overheadRemark !== undefined) {
      return false
    }

    setOverheadObj({
      ...overheadObj,
      Remark: getValues('overheadRemark')
    })

    if (getValues(`overheadRemark`)) {
      Toaster.success('Remark saved successfully')
    }
    var button = document.getElementById(`popUpTriggerOverhead`)
    button.click()
  }


  const onRemarkPopUpCloseOverHead = () => {
    let button = document.getElementById(`popUpTriggerOverhead`)
    setValue(`overheadRemark`, overheadObj.Remark)
    if (errors.overheadRemark) {
      delete errors.overheadRemark;
    }
    button.click()
  }

  const onRemarkPopUpClickProfit = () => {

    if (errors.profitRemark !== undefined) {
      return false
    }

    setProfitObj({
      ...profitObj,
      Remark: getValues('profitremark')
    })

    if (getValues(`profitremark`)) {
      Toaster.success('Remark saved successfully')
    }
    var button = document.getElementById(`popUpTriggerProfit`)
    button.click()
  }

  const onRemarkPopUpCloseProfit = () => {
    let button = document.getElementById(`popUpTriggerProfit`)
    setValue(`profitremark`, profitObj.Remark)
    if (errors.profitremark) {
      delete errors.profitremark;
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
                  onRemarkPopUpClick={onRemarkPopUpClickOverHead}
                  onRemarkPopUpClose={onRemarkPopUpCloseOverHead}
                />
              </Col>


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
                  onRemarkPopUpClick={onRemarkPopUpClickProfit}
                  onRemarkPopUpClose={onRemarkPopUpCloseProfit}
                />
              </Col>
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
            <WarningMessage  message={'When you make any changes in RM + CC, Surface Treatment, or Tool Cost, you need to save the updated values.'} />
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
