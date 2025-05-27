import React, { useState, useContext, useEffect } from 'react';
import { connect, } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, TabContent, TabPane, Nav, NavItem, NavLink, } from 'reactstrap';
import classnames from 'classnames';
import TabRMCC from './TabRMCC';
import TabSurfaceTreatment from './TabSurfaceTreatment';
import TabOverheadProfit from './TabOverheadProfit';
import TabPackagingFreight from './TabPackagingFreight';
import TabDiscountOther from './TabDiscountOther';
import { costingInfoContext, NetPOPriceContext } from '../CostingDetailStepTwo';
import BOMViewer from '../../../masters/part-master/BOMViewer';
import {
  saveComponentCostingRMCCTab, setComponentItemData, saveComponentOverheadProfitTab, setComponentOverheadItemData,
  saveCostingPackageFreightTab, setComponentPackageFreightItemData, saveToolTab, setComponentToolItemData,
  saveDiscountOtherCostTab, setComponentDiscountOtherItemData, setCostingEffectiveDate, CloseOpenAccordion, saveAssemblyPartRowCostingCalculation, isDataChange, saveAssemblyOverheadProfitTab, isToolDataChange, isOverheadProfitDataChange, setOverheadProfitData, saveCostingPaymentTermDetail,
  saveCostingBasicDetails,
  getCostingCostDetails,
  getExchangeRateByCurrency,
  setCurrencySource,
  setExchangeRateSourceValue,
  exchangeRateReducer,
  setOperationApplicabilitySelect,
  setProcessApplicabilitySelect,
} from '../../actions/Costing';
import { checkForNull, CheckIsCostingDateSelected, getConfigurationKey, getExchangeRateParams, loggedInUserId } from '../../../../helper';
import { COSTINGOVERHEADANDPROFTFORPROCESS, COSTINGOVERHEADANDPROFTOPERATION, customHavellsChanges, LEVEL1, WACTypeId, ZBCTypeId } from '../../../../config/constants';
import { EditCostingContext, ViewCostingContext, CostingStatusContext, IsPartType, IsNFR } from '../CostingDetails';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DayTime from '../../../common/DayTimeWrapper'
import TabAssemblyTechnology from './TabAssemblyTechnology';
import { checkNegativeValue, createToprowObjAndSave, errorCheck, errorCheckObject, findSurfaceTreatmentData } from '../../CostingUtil';
import _ from 'lodash'
import { ASSEMBLY, IdForMultiTechnology, TOOLING_ID } from '../../../../config/masterData';
import WarningMessage from '../../../common/WarningMessage';
import { reactLocalStorage } from 'reactjs-localstorage';
import { LOGISTICS } from '../../../../config/masterData';
import TourWrapper from '../../../common/Tour/TourWrapper';
import { Steps } from '../TourMessages';
import { useTranslation } from 'react-i18next';
import { getRMFromNFR, setOpenAllTabs } from '../../../masters/nfr/actions/nfr';
import Toaster from '../../../common/Toaster';
import TabToolCost from './TabToolCost';
import { getCostingCondition, getExchangeRateSource, getTaxCodeSelectList } from '../../../../actions/Common';
import { SearchableSelectHookForm } from '../../../layout/HookFormInputs';
import { Controller, useForm } from 'react-hook-form';
import { getCurrencySelectList } from '../../../masters/actions/ExchangeRateMaster';
import { getCostingConditionTypes, getEffectiveDateMaxDate, getEffectiveDateMinDate } from '../../../common/CommonFunctions';
import { createSaveComponentObject } from '../../CostingUtilSaveObjects';
export const PreviousTabData = React.createContext();

function CostingHeaderTabs(props) {
  const dispatch = useDispatch()
  const { t } = useTranslation("Costing");
  const { ComponentItemData, ComponentItemOverheadData, ComponentItemPackageFreightData, ComponentItemToolData,
    ComponentItemDiscountData, PaymentTermDataDiscountTab, IsIncludedSurfaceInOverheadProfit, costingData, CostingEffectiveDate,
    IsCostingDateDisabled, CostingDataList, RMCCTabData, getAssemBOPCharge, SurfaceTabData, OverheadProfitTabData, PackageAndFreightTabData, ToolTabData, DiscountCostData, checkIsDataChange, checkIsOverheadProfitChange, checkIsFreightPackageChange, checkIsToolTabChange, messageForAssembly, checkIsDiscountChange, ActualCostingDataList, IsIncludedSurfaceInRejection, IsIncludedToolCost, includeOverHeadProfitIcc, includeToolCostIcc } = useSelector(state => state.costing)
  const { ErrorObjRMCC, ErrorObjOverheadProfit, ErrorObjTools, ErrorObjDiscount, costingOpenCloseStatus } = useSelector(state => state.costing)
  const [isBOPExists, setIsBOPExists] = useState(false)
  const [isPartExists, setIsPartExists] = useState(false)
  const [ispartLocked, setIsPartLocked] = useState(false)
  const [activeTab, setActiveTab] = useState('1');
  const [previousTab, setPreviousTab] = useState('1');
  const [IsOpenViewHirarchy, setIsOpenViewHirarchy] = useState(false);
  const [IsCalledAPI, setIsCalledAPI] = useState(true);
  const [multipleRMApplied, setMultipleRMApplied] = useState(false)
  const [effectiveDate, setEffectiveDate] = useState(DayTime(costingData.EffectiveDate).isValid() ? DayTime(costingData.EffectiveDate) : '');
  const [warningMessageObj, setWarningMessageObj] = useState({
    tabName: '',
    messageShow: false
  })
  const [tabsTour, setTabsTour] = useState({
    steps: [],
    hints: [],
    tourStarted: false
  })
  const costData = useContext(costingInfoContext);
  const CostingViewMode = useContext(ViewCostingContext);
  const netPOPrice = useContext(NetPOPriceContext);
  const CostingEditMode = useContext(EditCostingContext);
  const partType = (IdForMultiTechnology.includes(String(costData?.TechnologyId)) || costData.CostingTypeId === WACTypeId)
  const isPartType = useContext(IsPartType);
  const isNFR = useContext(IsNFR);

  const costingApprovalStatus = useContext(CostingStatusContext);
  const { nfrDetailsForDiscount, exchangeRateData } = useSelector(state => state.costing)
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const ActualTotalCost = ActualCostingDataList && ActualCostingDataList.length > 0 && ActualCostingDataList[0].TotalCost !== undefined ? ActualCostingDataList[0].TotalCost : 0;
  const isRequestForMultiTechnology = IdForMultiTechnology?.includes(String(costData?.TechnologyId))
  const { register, handleSubmit, formState: { errors }, control, setValue, getValues, reset, isRMAssociated } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });
  const currencySelectList = useSelector(state => state?.exchangeRate?.currencySelectList)
  const exchangeRateSourceList = useSelector((state) => state.comman.exchangeRateSourceList)
  const [exchangeRateSource, setExchangeRateSource] = useState('');
  const [currency, setCurrency] = useState('');

  useEffect(() => {
    setActiveTab(costingData?.TechnologyId !== LOGISTICS ? '1' : '4')
    setExchangeRateSource({ label: costData?.ExchangeRateSourceName, value: costData?.ExchangeRateSourceName })
    dispatch(setExchangeRateSourceValue({ label: costData?.ExchangeRateSourceName, value: costData?.ExchangeRateSourceName }))
    setTimeout(() => {
      setCurrency({ label: costData?.CostingCurrency, value: costData?.CostingCurrencyId })
    }, 500)
    dispatch(setCurrencySource({ label: costData?.CostingCurrency, value: costData?.CostingCurrencyId }))
    dispatch(exchangeRateReducer({
      plantExchangeRate: costData?.LocalCurrencyExchangeRate,
      baseExchangeRate: costData?.BaseCurrencyExchangeRate,
      plantFromCurrency: costData?.CostingCurrency,
      plantToCurrency: costData?.LocalCurrency,
      baseFromCurrency: costData?.CostingCurrency,
      baseToCurrency: initialConfiguration?.BaseCurrency,
    }))
    setValue('Currency', { label: costData?.CostingCurrency, value: costData?.CostingCurrencyId })
    setValue('ExchangeSource', { label: costData?.ExchangeRateSourceName, value: costData?.ExchangeRateSourceName })
  }, [costingData, costData])

  useEffect(() => {
    dispatch(getCurrencySelectList(true, () => { }))
    dispatch(getExchangeRateSource((res) => { }))
  }, [])

  const callExchangeRateAPI = (fromCurrency, toCurrency) => {
    return new Promise((resolve) => {
      const { costingHeadTypeId, vendorId, clientId } = getExchangeRateParams({ fromCurrency: fromCurrency, toCurrency: toCurrency, defaultCostingTypeId: costData?.CostingTypeId, vendorId: costData?.VendorId, clientValue: costData?.CustomerId, plantCurrency: costData?.LocalCurrency });
      dispatch(getExchangeRateByCurrency(fromCurrency, costingHeadTypeId, DayTime(CostingEffectiveDate).format('YYYY-MM-DD'), vendorId, clientId, false, toCurrency, exchangeRateSource?.value, (res) => {
        resolve(res);
      }))
    });
  }

  useEffect(() => {

    if (currency && effectiveDate && exchangeRateSource && !costData?.ExchangeRateId && ((costData?.TechnologyId === ASSEMBLY || costData?.PartType === 'Assembly') ? true : !costData?.CostingCurrencyId)) {
      let arr = [];
      let exchangeData = {
        plantExchangeRate: null,
        baseExchangeRate: null,
        plantToCurrency: initialConfiguration?.BaseCurrency,
        plantFromCurrency: costData?.LocalCurrency,
        baseToCurrency: costData?.LocalCurrency,
        baseFromCurrency: currency?.label
      };
      if (currency?.label !== costData?.LocalCurrency || costData?.LocalCurrency !== initialConfiguration?.BaseCurrency) {
        callExchangeRateAPI(currency?.label, costData?.LocalCurrency).then(res => {
          exchangeData = {
            baseExchangeRate: res?.data?.Data && Object.keys(res?.data?.Data).length > 0 ? true : false,
            plantExchangeRate: null,
            plantToCurrency: initialConfiguration?.BaseCurrency,
            plantFromCurrency: costData?.LocalCurrency,
            baseToCurrency: costData?.LocalCurrency,
            baseFromCurrency: currency?.label
          };

          arr.push(res?.data?.Data);

          return callExchangeRateAPI(costData?.LocalCurrency, initialConfiguration?.BaseCurrency);
        }).then(resp => {

          exchangeData.plantExchangeRate = resp?.data?.Data && Object.keys(resp?.data?.Data).length > 0 ? Boolean(resp?.data?.Data) : false;
          arr.push(resp?.data?.Data);

          dispatch(exchangeRateReducer(exchangeData));

          // Create and dispatch saveCostingBasicDetails only after both API calls complete
          let obj = {
            "BaseCostingId": costData?.CostingId,
            "EffectiveDate": DayTime(effectiveDate).format('YYYY-MM-DD'),
            "ExchangeRateSourceName": exchangeRateSource?.value,
            "CostingCurrencyId": currency?.value,
            "LocalCurrencyExchangeRate": arr[0]?.CurrencyExchangeRate ?? 1,
            "BaseCurrencyExchangeRate": arr[1]?.CurrencyExchangeRate ?? 1,
            "ExchangeRateId": arr[0]?.ExchangeRateId ?? null,
            "LocalExchangeRateId": arr[1]?.ExchangeRateId ?? null,
            "LoggedInUserId": loggedInUserId()
          };

          dispatch(saveCostingBasicDetails(obj, res => { }));
        });
      } else {


        // If no API calls needed, just dispatch the actions with default values
        dispatch(exchangeRateReducer(exchangeData));

        let obj = {
          "BaseCostingId": costData?.CostingId,
          "EffectiveDate": DayTime(effectiveDate).format('YYYY-MM-DD'),
          "ExchangeRateSourceName": exchangeRateSource?.value,
          "CostingCurrencyId": currency?.value,
          "LocalCurrencyExchangeRate": 1,
          "BaseCurrencyExchangeRate": 1,
          "ExchangeRateId": null,
          "LocalExchangeRateId": null,
          "LoggedInUserId": loggedInUserId()
        };

        dispatch(saveCostingBasicDetails(obj, res => { }));
      }
    }
  }, [currency, exchangeRateSource, effectiveDate]);
  const checkOperationApplicability = () => {
    const currentTabData = RMCCTabData?.[0];
    if (currentTabData?.CostingPartDetails?.CostingConversionCost?.CostingOperationCostResponse?.length > 0) {
      const operations = currentTabData?.CostingPartDetails?.CostingConversionCost?.CostingOperationCostResponse;
      const hasMissingApplicability = operations?.some(item => !item?.CostingConditionMasterAndTypeLinkingId);
      if (operations?.length > 0 && hasMissingApplicability) {
        Toaster.warning('Please select Applicability for all operations');
        return false;
      }
    }
    return true;
  };
  useEffect(() => {

    // CALLED WHEN OTHER TAB CLICKED WITHOUT SAVING TO RMCC CURRENT TAB.
    if (!CostingViewMode && Object.keys(ComponentItemData).length > 0 && ComponentItemData.IsOpen !== false && activeTab !== '1' && IsCalledAPI && checkIsDataChange) {
      const hasNegativeValue = checkNegativeValue(ComponentItemData?.CostingPartDetails?.CostingRawMaterialsCost, 'NetLandedCost', 'Net Landed Cost')
      if (hasNegativeValue) {
        return false;
      }


      let stCostingData = findSurfaceTreatmentData(ComponentItemData)

      const basicRateComponent = checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.NetOverheadAndProfitCost) + checkForNull(RMCCTabData[0]?.CostingPartDetails?.NetTotalRMBOPCC) +
        checkForNull(SurfaceTabData[0]?.CostingPartDetails?.NetSurfaceTreatmentCost) + checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
        checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) + checkForNull(DiscountCostData?.AnyOtherCost) + (initialConfiguration?.IsAddPaymentTermInNetCost ? checkForNull(DiscountCostData?.paymentTermCost) : 0) - checkForNull(DiscountCostData?.HundiOrDiscountValue)

      let netPOPrice = checkForNull(basicRateComponent) + checkForNull(DiscountCostData?.totalConditionCost)

      let requestData = createSaveComponentObject(ComponentItemData, CostingEffectiveDate, basicRateComponent, netPOPrice)



      let obj = {
        costingId: ComponentItemData?.CostingId,
        subAsmCostingId: ComponentItemData?.SubAssemblyCostingId,
        asmCostingId: ComponentItemData?.AssemblyCostingId
      }
      dispatch(getCostingCostDetails(obj, response => {
        let allCostingData = response?.data?.Data
        let basicRate
        let netPOPriceTemp

        if (ComponentItemData?.PartType === "Component") {          // COMPONENT
          basicRate = basicRateComponent
          netPOPriceTemp = checkForNull(basicRateComponent) + checkForNull(DiscountCostData?.totalConditionCost)
        } else if (ComponentItemData?.PartType === "Part") {          // CHILD PART OF ASM : COMPONENT
          basicRate = (checkForNull(allCostingData?.NetSurfaceTreatmentCost) + checkForNull(ComponentItemData?.CostingPartDetails?.NetTotalRMBOPCC))
          netPOPriceTemp = (checkForNull(allCostingData?.NetSurfaceTreatmentCost) + checkForNull(ComponentItemData?.CostingPartDetails?.NetTotalRMBOPCC))
        }

        if (response?.data?.Result) {
          let requestData = createSaveComponentObject(ComponentItemData, CostingEffectiveDate, basicRate, netPOPriceTemp)
          dispatch(saveComponentCostingRMCCTab(requestData, res => {
            callAssemblyAPi(1)
            dispatch(CloseOpenAccordion())
            dispatch(setComponentItemData({}, () => { }))
            setIsCalledAPI(false)
            InjectDiscountAPICall()
            dispatch(isDataChange(false))
          }))
        }
      }))
    }

    // USED FOR OVERHEAD AND PROFIT WHEN CLICKED ON OTHER TABS WITHOUT SAVING
    if (!CostingViewMode && Object.keys(ComponentItemOverheadData).length > 0 && ComponentItemOverheadData.IsOpen !== false && activeTab !== '5' && checkIsOverheadProfitChange) {
      const discountAndOtherTabData = DiscountCostData
      let reqData = {
        "CostingId": ComponentItemOverheadData.CostingId,
        "IsIncludeSurfaceTreatmentWithOverheadAndProfit": IsIncludedSurfaceInOverheadProfit,
        "IsIncludeSurfaceTreatmentWithRejection": IsIncludedSurfaceInRejection,
        "IsIncludeToolCostWithOverheadAndProfit": IsIncludedToolCost,
        "IsIncludeOverheadAndProfitInICC": includeOverHeadProfitIcc,
        "IsIncludeToolCostInCCForICC": includeToolCostIcc,
        "LoggedInUserId": loggedInUserId(),
        "IsSurfaceTreatmentApplicable": true,
        "IsApplicableForChildParts": false,
        "CostingNumber": costData.CostingNumber,
        "EffectiveDate": CostingEffectiveDate,
        "TotalCost": netPOPrice,
        "NetOverheadAndProfitCost": checkForNull(ComponentItemOverheadData?.CostingPartDetails?.OverheadCost) +
          checkForNull(ComponentItemOverheadData?.CostingPartDetails?.ProfitCost) +
          checkForNull(ComponentItemOverheadData?.CostingPartDetails?.RejectionCost) +
          checkForNull(ComponentItemOverheadData?.CostingPartDetails?.ICCCost),
        "CostingPartDetails": {
          ...ComponentItemOverheadData?.CostingPartDetails,
          NetOverheadAndProfitCost: checkForNull(ComponentItemOverheadData?.CostingPartDetails?.OverheadCost) +
            checkForNull(ComponentItemOverheadData?.CostingPartDetails?.RejectionCost) +
            checkForNull(ComponentItemOverheadData?.CostingPartDetails?.ProfitCost) +
            checkForNull(ComponentItemOverheadData?.CostingPartDetails?.ICCCost)
        },
        "BasicRate": discountAndOtherTabData?.BasicRateINR,
      }
      if (ComponentItemOverheadData.IsAssemblyPart) {
        dispatch(saveAssemblyOverheadProfitTab(reqData, res => {
          callAssemblyAPi(5)
          dispatch(setComponentOverheadItemData({}, () => { }))
          InjectDiscountAPICall()
          dispatch(isOverheadProfitDataChange(false))
          let arrTemp = [...OverheadProfitTabData]
          arrTemp[0].IsOpen = false
          dispatch(setOverheadProfitData(arrTemp, () => { }))
        }))
      } else {
        dispatch(saveComponentOverheadProfitTab(reqData, res => {
          callAssemblyAPi(5)
          dispatch(setComponentOverheadItemData({}, () => { }))
          InjectDiscountAPICall()
          let arrTemp = [...OverheadProfitTabData]
          arrTemp[0].IsOpen = false
          dispatch(setOverheadProfitData(arrTemp, () => { }))
        }))
      }


    }
    const discountAndOtherTabData = DiscountCostData

    // USED FOR PACKAGE AND FREIGHT WHEN CLICKED ON OTHER TABS WITHOUT SAVING
    if (!CostingViewMode && Object.keys(ComponentItemPackageFreightData).length > 0 && ComponentItemPackageFreightData.IsChanged === true && activeTab !== '4' && Object.keys(ComponentItemPackageFreightData).length > 0 && ComponentItemPackageFreightData.IsChanged === true && checkIsFreightPackageChange) {

      const data = {
        "CostingId": costData.CostingId,
        "PartId": costData.PartId,
        "PartNumber": costData.PartNumber,
        "NetPOPrice": netPOPrice,
        "LoggedInUserId": loggedInUserId(),
        "EffectiveDate": CostingEffectiveDate,
        "TotalCost": netPOPrice,
        "CostingNumber": costData.CostingNumber,
        //"NetPackagingAndFreight": ComponentItemPackageFreightData.NetPackagingAndFreight,
        "CostingPartDetails": ComponentItemPackageFreightData?.CostingPartDetails,
        "BasicRate": discountAndOtherTabData?.BasicRateINR,
      }
      dispatch(saveCostingPackageFreightTab(data, res => {
        callAssemblyAPi(4)
        dispatch(setComponentPackageFreightItemData({}, () => { }))
        InjectDiscountAPICall()
      }))
    }

    // USED FOR TOOL TAB WHEN CLICKED ON OTHER TABS WITHOUT SAVING

    if (!CostingViewMode && Object.keys(ComponentItemToolData).length > 0 && ComponentItemToolData.IsChanged === true && ComponentItemToolData?.CostingPartDetails?.TotalToolCost > 0 && activeTab !== '3' && checkIsToolTabChange) {

      const data = {
        "IsToolCostProcessWise": ComponentItemToolData?.CostingPartDetails?.IsToolCostProcessWise,
        "CostingId": costData.CostingId,
        "PartId": costData.PartId,
        "LoggedInUserId": loggedInUserId(),
        "CostingNumber": costData.CostingNumber,
        "ToolCost": ComponentItemToolData.TotalToolCost,
        "CostingPartDetails": ComponentItemToolData?.CostingPartDetails,
        "EffectiveDate": CostingEffectiveDate,
        "TotalCost": netPOPrice,
        "BasicRate": discountAndOtherTabData?.BasicRateINR,
      }
      dispatch(saveToolTab(data, res => {
        callAssemblyAPi(3)
        dispatch(setComponentToolItemData({}, () => { }))
        dispatch(isToolDataChange(false))
        InjectDiscountAPICall()
      }))
    }


    // USED FOR SAVE OTHER DISCOUNT WHEN CLICKED ON OTHER TABS WITHOUT SAVING
    if (!CostingViewMode && (activeTab !== '6') && checkIsDiscountChange)
      InjectDiscountAPICall()

    if (checkIsDataChange === false) {
      dispatch(CloseOpenAccordion())
      dispatch(isDataChange(false))
    }

    // APPLY CHECKS HERE FOR ASSEMBLY TECHNOLOGY COSTING
    if (RMCCTabData && RMCCTabData.length > 0 && activeTab !== '1' && CostingViewMode === false && !partType) {
      const tabData = RMCCTabData[0]
      const surfaceTabData = SurfaceTabData[0]
      const overHeadAndProfitTabData = OverheadProfitTabData[0]
      const discountAndOtherTabData = DiscountCostData
      let tempArrForCosting = JSON.parse(sessionStorage.getItem('costingArray'))
      const data = _.find(tempArrForCosting, ['IsPartLocked', true])
      const lockedData = _.find(tempArrForCosting, ['IsLocked', true])
      const bopData = _.find(tempArrForCosting, ['PartType', 'BOP'])
      if (data !== undefined || bopData !== undefined || lockedData !== undefined) {

        let assemblyRequestedData = createToprowObjAndSave(tabData, surfaceTabData, PackageAndFreightTabData, overHeadAndProfitTabData, ToolTabData, discountAndOtherTabData, netPOPrice, getAssemBOPCharge, 1, CostingEffectiveDate, '', '', isPartType, initialConfiguration?.IsAddPaymentTermInNetCost)

        dispatch(saveAssemblyPartRowCostingCalculation(assemblyRequestedData, res => { }))
      }
      let surfaceArrForCosting = JSON.parse(sessionStorage.getItem('surfaceCostingArray'))
      const surfaceData = _.find(surfaceArrForCosting, ['IsPartLocked', true])
      const surfaceLockedData = _.find(surfaceArrForCosting, ['IsLocked', true])
      if (surfaceData !== undefined || surfaceLockedData !== undefined) {
        let assemblyRequestedData = createToprowObjAndSave(tabData, surfaceTabData, PackageAndFreightTabData, overHeadAndProfitTabData, ToolTabData, discountAndOtherTabData, netPOPrice, getAssemBOPCharge, 2, CostingEffectiveDate, '', '', isPartType, initialConfiguration?.IsAddPaymentTermInNetCost)
        dispatch(saveAssemblyPartRowCostingCalculation(assemblyRequestedData, res => { }))
      }
    }

  }, [activeTab])
  useEffect(() => {
    if (RMCCTabData && RMCCTabData.length > 0 && RMCCTabData[0].CostingChildPartDetails) {

      const partTypes = RMCCTabData[0].CostingChildPartDetails.map(item => item.PartType);

      const isBOPExists = partTypes.includes('BOP');
      const isPartExists = partTypes.includes('Part');

      setIsBOPExists(isBOPExists);
      setIsPartExists(isPartExists);
      const isPartLocked = RMCCTabData[0].CostingChildPartDetails.some(item => (item.PartType === 'Part' || item.PartType === 'Sub Assembly') && (item.IsPartLocked || item.IsLocked));
      const issubAssemblyLocked = RMCCTabData[0].CostingChildPartDetails.some(item => item.PartType === 'Sub Assembly' && (item.IsPartLocked || item.IsLocked));
      setIsPartLocked(isPartLocked);
    }
  }, [RMCCTabData]);

  useEffect(() => {
    if (RMCCTabData && RMCCTabData.length > 0 && RMCCTabData[0]?.IsMultipleRMApplied) {
      setMultipleRMApplied(true)
    }
  }, [RMCCTabData]);
  useEffect(() => {
    if (activeTab === '6') {
      dispatch(getTaxCodeSelectList((res) => { }))
    }
  }, [activeTab]);

  useEffect(() => {
    const operationConditionTypeId = getCostingConditionTypes(COSTINGOVERHEADANDPROFTOPERATION)
    dispatch(getCostingCondition(null, operationConditionTypeId, isRequestForMultiTechnology, (res) => {
      if (res?.data?.DataList) {
        const operationData = res?.data?.DataList.map(item => ({
          label: item?.CostingConditionNumber,
          value: item?.CostingConditionMasterId
        }));
        dispatch(setOperationApplicabilitySelect(operationData));
      }
    }))

    const processConditionTypeId = getCostingConditionTypes(COSTINGOVERHEADANDPROFTFORPROCESS)
    dispatch(getCostingCondition(null, processConditionTypeId, isRequestForMultiTechnology, (res) => {
      if (res?.data?.DataList) {
        const processData = res?.data?.DataList.map(item => ({
          label: item?.CostingConditionNumber,
          value: item?.CostingConditionMasterId
        }));
        dispatch(setProcessApplicabilitySelect(processData));
      }
    }))
  }, []);



  const callAssemblyAPi = (tabId) => {
    if (costData.IsAssemblyPart && IsCalledAPI && !CostingViewMode && !partType) {
      const tabData = RMCCTabData && RMCCTabData[0]
      const surfaceTabData = SurfaceTabData && SurfaceTabData[0]
      const overHeadAndProfitTabData = OverheadProfitTabData && OverheadProfitTabData[0]
      const discountAndOtherTabData = DiscountCostData

      let assemblyRequestedData = createToprowObjAndSave(tabData, surfaceTabData, PackageAndFreightTabData, overHeadAndProfitTabData, ToolTabData, discountAndOtherTabData, netPOPrice, getAssemBOPCharge, tabId, CostingEffectiveDate, '', '', isPartType, initialConfiguration?.IsAddPaymentTermInNetCost)
      dispatch(saveAssemblyPartRowCostingCalculation(assemblyRequestedData, res => { }))
    }
  }


  const InjectDiscountAPICall = () => {
    if (!CostingViewMode && activeTab !== '6') {
      dispatch(saveDiscountOtherCostTab({ ...ComponentItemDiscountData, CallingFrom: 1, /* BasicRate: DiscountCostData?.BasicRateINR */ }, res => {
        if (Number(previousTab) === 6) {
          dispatch(saveCostingPaymentTermDetail(PaymentTermDataDiscountTab, (res) => { }));
        }
      }));
    }
  }

  /**
  * @method toggle
  * @description toggling the tabs
  */
  const toggle = (tab) => {
    const hasNegativeValue = checkNegativeValue(ComponentItemData?.CostingPartDetails?.CostingRawMaterialsCost, 'NetLandedCost', 'Net Landed Cost')
    if (hasNegativeValue) {
      return false;
    }
    if (false && isNFR && !CostingViewMode && (CostingDataList[0].NetRMCost === 0 || CostingDataList[0].NetRMCost === null || CostingDataList[0].NetRMCost === undefined) && (tab === '2' || tab === '3' || tab === '4' || tab === '5' || tab === '6')) {
      Toaster.warning("Please add RM detail before adding the data in this tab.")
      return false
    }
    if (CheckIsCostingDateSelected(CostingEffectiveDate, currency, exchangeRateData)) return false;

    let tempErrorObjRMCC = { ...ErrorObjRMCC }


    delete tempErrorObjRMCC?.bopGridFields
    // tourStartRef()
    if (errorCheck(ErrorObjRMCC) || errorCheckObject(tempErrorObjRMCC) || errorCheckObject(ErrorObjOverheadProfit) || errorCheckObject(ErrorObjTools) || errorCheckObject(ErrorObjDiscount)) return false;
    if (activeTab !== tab) {
      if (activeTab === '1' && !checkOperationApplicability()) {
        return;
      }
      setPreviousTab(activeTab)
      setActiveTab(tab);

      if (tab === '1') {
        setIsCalledAPI(true)
      }
    }
    switch (tab) {
      case "1":
        setWarningMessageObj({
          tabName: '',
          messageShow: false
        })
        break
      case "2":
        setWarningMessageObj({
          tabName: '',
          messageShow: false
        })
        break
      case "5":
        setWarningMessageObj({
          tabName: 'Overheads & Profits',
          messageShow: true
        })
        break;
      case "4":
        setWarningMessageObj({
          tabName: 'Packaging & Freight',
          messageShow: true
        })
        break;
      case "3":
        setWarningMessageObj({
          tabName: 'Tool Cost',
          messageShow: true
        })
        break;
      case "6":
        setWarningMessageObj({
          tabName: 'Discount & Other Cost',
          messageShow: true
        })
        break;
      default:
        break;
    }
  }

  /**
   * @method handleEffectiveDateChange
   * @description Handle Effective Date
   */
  const handleEffectiveDateChange = (date) => {
    setEffectiveDate(date)
    dispatch(setCostingEffectiveDate(DayTime(date).format('YYYY-MM-DD')))
  }

  /**
   * @method dateFunction
   * @description date Function
   */
  const dateFunction = () => {

    let arr = [costData?.LastApproveEffectiveDate, costData?.PartEffectiveDate, new Date(getEffectiveDateMinDate())?.toISOString()?.split('.')[0]  // Converted format
    ]

    const largestDate = new Date(Math.max(...arr.filter(Boolean).map(date => Date.parse(date))));
    return new Date(largestDate)
  }

  useEffect(() => {
    if (isNFR && effectiveDate && false) {
      let obj = {
        nfrId: nfrDetailsForDiscount?.objectFordisc?.NfrMasterId,
        partId: costData?.PartId,
        vendorId: costData?.VendorId,
        plantId: costData?.DestinationPlantId,
        costingId: ComponentItemData.CostingId,
        effectiveDate: CostingEffectiveDate,
        technologyId: costData?.TechnologyId
      }
      dispatch(getRMFromNFR(obj, (res) => {

        if (res?.data?.Result && res?.status === 200) {
          if (res?.data?.Identity === res?.data?.DataList?.length) {
            dispatch(setOpenAllTabs(true))
          } else {
            dispatch(setOpenAllTabs(false))
          }
        } else if (res?.status === 204) {
          dispatch(setOpenAllTabs(false))
        }
      }))
    }
    dispatch(setCostingEffectiveDate(DayTime(effectiveDate).format('YYYY-MM-DD')))
  }, [effectiveDate])

  /**
  * @method closeVisualDrawer
  * @description CLOSE VISUAL AD DRAWER
  */
  const closeVisualDrawer = () => {
    setIsOpenViewHirarchy(false)
  }
  const tourStart = () => {
    setTabsTour(prevState => ({
      ...prevState,
      tourStarted: true
    }))
    tourStartRef()
  }

  const tourStartRef = () => {
    switch (Number(activeTab)) {
      case 1:

        if (costingOpenCloseStatus.RMC) {

          if (IdForMultiTechnology.includes(String(costingData?.TechnologyId))) {
            setTabsTour(prevState => ({
              ...prevState,
              steps: Steps(t, '', { bopHandling: costingOpenCloseStatus.bopHandling }).TAB_PARTCOST,
              hints: []
            }))

          } else {
            setTabsTour(prevState => ({
              ...prevState,
              steps: Steps(t, '', { multipleRMApplied: multipleRMApplied, CostingViewMode: CostingViewMode, CostingEditMode: CostingEditMode, PartExists: isPartExists, isPartLocked: ispartLocked }).TAB_RMC,
              hints: []
            }))
          }

        } else {
          const tempStep = [];
          if ((CostingViewMode || IsCostingDateDisabled || (CostingEditMode & costData?.EffectiveDate !== null && costData?.EffectiveDate !== undefined && DayTime(new Date(costData?.EffectiveDate)).isValid()))) {
            for (let i = 1; i < Steps(t, '', { assembly: (!IdForMultiTechnology.includes(String(costingData?.TechnologyId)) && costData.IsAssemblyPart), bopHandling: costingOpenCloseStatus.bopHandling }).COSTING_TABS.length; i++) {
              tempStep.push(Steps(t, '', { assembly: (!IdForMultiTechnology.includes(String(costingData?.TechnologyId)) && costData.IsAssemblyPart), bopHandling: costingOpenCloseStatus.bopHandling }).COSTING_TABS[i])
            }

            setTabsTour(prevState => ({
              ...prevState,
              steps: tempStep,
              hints: Steps(t).PART_HINT
            }))


          } else {
            setTabsTour(prevState => ({
              ...prevState,
              steps: Steps(t, '', { assembly: (!IdForMultiTechnology.includes(String(costingData?.TechnologyId)) && costData.IsAssemblyPart), bopHandling: costingOpenCloseStatus.bopHandling }).COSTING_TABS,
              hints: Steps(t).PART_HINT
            }));


          }
        }
        break;
      case 2:
        setTabsTour(prevState => ({
          ...prevState,
          steps: Steps(t).TAB_ST,
          hints: []
        }))
        break;
      case 5:
        if (costingOpenCloseStatus.overheadProfit) {
          setTabsTour(prevState => ({
            ...prevState,
            steps: Steps(t).TAB_OVERHEAD_PROFIT,
            hints: []
          }))
        } else {
          let tempStep = Steps(t).TAB_OVERHEAD_PROFIT.filter((item, ind) => ind < 4)
          setTabsTour(prevState => ({
            ...prevState,
            steps: tempStep,
            hints: Steps(t).OVERHEAD_HINT
          }))
        }
        break;
      case 4:
        setTabsTour(prevState => ({
          ...prevState,
          steps: Steps(t).TAB_PACKAGE_FREIGHT,
          hints: []
        }))
        break;
      case 3:
        setTabsTour(prevState => ({
          ...prevState,
          steps: Steps(t).TAB_TOOL,
          hints: []
        }))
        break;
      case 6:
        setTabsTour(prevState => ({
          ...prevState,
          steps: Steps(t).TAB_DISCOUNT_OTHERS,
          hints: []
        }))
        break;

      default:
        break;
    }

  }

  const [countKey, setCountKey] = useState(0);

  useEffect(() => {
    setCountKey(countKey + 1)
    tourStartRef()
  }, [activeTab])

  /**
  * @method renderListing
  * @description Used show listing of unit of measurement
  */
  const renderListing = (label) => {
    const listingMap = {
      ExchangeSource: { list: exchangeRateSourceList, labelKey: 'Text', valueKey: 'Value', filter: item => item.Value !== '--Exchange Rate Source Name--' },
      Currency: { list: currencySelectList, labelKey: 'Text', valueKey: 'Value' }
    };

    const { list, labelKey, valueKey, filter } = listingMap[label] || {};

    if (!list) return [];

    return list.reduce((acc, item) => {
      if (item[valueKey] === '0') return acc;
      if (filter && !filter(item)) return acc;
      acc.push({ label: item[labelKey], value: item[valueKey] });
      return acc;
    }, []);
  }

  const handleExchangeRateSource = (value) => {
    setExchangeRateSource(value)
    dispatch(setExchangeRateSourceValue(value))
  }

  const handleChangeCurrency = (value) => {
    setCurrency(value)
    dispatch(setCurrencySource(value))
  }

  const warningMessage = <span className='part-flow'>Child Parts (<span title={messageForAssembly}>{messageForAssembly}</span>) costing is under approval flow</span>
  return (
    <>
      <div className="user-page p-0">
        <Row className="justify-content-between align-items-end">
          <Row>
            {getConfigurationKey().IsSourceExchangeRateNameVisible && <Col md="3">
              <SearchableSelectHookForm
                label="Exchange Rate Source"
                name="ExchangeSource"
                Controller={Controller}
                control={control}
                register={register}
                mandatory={false}
                rules={{ required: false }}
                placeholder={'Select'}
                options={renderListing("ExchangeSource")}
                handleChange={handleExchangeRateSource}
                defaultValue={exchangeRateSource?.length !== 0 ? exchangeRateSource : ""}
                disabled={(costData?.ExchangeRateSourceName ? true : false) || CostingViewMode}
              />
            </Col>}
            <Col md="3">
              <SearchableSelectHookForm
                label="Currency"
                name="Currency"
                Controller={Controller}
                control={control}
                register={register}
                mandatory={true}
                rules={{ required: true }}
                placeholder={'Select'}
                options={renderListing("Currency")}
                handleChange={handleChangeCurrency}
                defaultValue={currency?.length !== 0 ? currency : ""}
                disabled={(costData?.CostingCurrencyId ? true : false) || CostingViewMode || IsCostingDateDisabled}
              />
            </Col>
            <Col md="3">
              <div className="form-group mb-0">
                <label>Costing Effective Date<span className="asterisk-required">*</span></label>
                <div className="inputbox date-section d-flex align-items-center ">
                  <DatePicker
                    name="EffectiveDate"
                    id="costing_effective_date"
                    //selected={effectiveDate ? new Date(effectiveDate) : ''}
                    selected={DayTime(effectiveDate).isValid() ? new Date(effectiveDate) : ''}
                    onChange={handleEffectiveDateChange}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    dateFormat="dd/MM/yyyy"
                    //maxDate={new Date()}
                    // USER SHOULD NOT BE ABLE TO SELECT EFFECTIVE DATE, OF BEFORE THE PART WAS CREATED
                    minDate={(customHavellsChanges && costingData.CostingTypeId === ZBCTypeId) ? new Date() : dateFunction()}

                    placeholderText="Select date"
                    className="withBorder"
                    autoComplete={"off"}
                    disabledKeyboardNavigation
                    onChangeRaw={(e) => e.preventDefault()}
                    disabled={(CostingViewMode || IsCostingDateDisabled || (CostingEditMode & costData?.EffectiveDate !== null && costData?.EffectiveDate !== undefined && DayTime(new Date(costData?.EffectiveDate)).isValid())) ? true : false}
                  />
                  {!CostingViewMode && <TourWrapper
                    buttonSpecificProp={{ id: "Costing_Tabs", onClick: tourStart }}
                    stepsSpecificProp={{
                      steps: tabsTour.steps,
                      hints: tabsTour.hints
                    }} />}
                </div>
              </div ></Col>
            <Col>
              {costData.IsAssemblyPart && <>
                <button
                  type="button"
                  onClick={() => setIsOpenViewHirarchy(true)}
                  class="btn-primary btn btn-lg mt-4 float-right">
                  <div className="hirarchy-icon"></div>
                  <span>View BOM</span>
                </button>
                {/* THIS WARNING MESSAGE WILL COME WHEN CHILD PART COSTING IS UNDER APPROVAL  */}
                {messageForAssembly !== '' && <div className={'mb-n2'}>
                  <WarningMessage message={warningMessage} />
                </div>}
              </>}
            </Col>
          </Row>
          {
            warningMessageObj.messageShow && costingApprovalStatus === "ApprovedByAssembly" && <Col md="12"> <div className='asm-message'>
              <WarningMessage message={`${warningMessageObj.tabName} values are entered for assembly only`} />
            </div></Col>
          }
        </Row >

        <div className='costing-tabs-container'>
          <Nav tabs className="subtabs cr-subtabs-head">
            {costingData.TechnologyId !== LOGISTICS && <NavItem>
              <NavLink id='RMC_tabs' className={classnames({ active: activeTab === '1' })} onClick={() => { toggle('1'); }}>
                {(IdForMultiTechnology.includes(String(costingData?.TechnologyId)) || costData.CostingTypeId === WACTypeId) ? 'Part Cost' : 'RM + CC'}
              </NavLink>
            </NavItem >}
            {
              costingData.TechnologyId !== LOGISTICS && <NavItem>
                <NavLink id='Surface_Treatment_tabs' className={classnames({ active: activeTab === '2' })} onClick={() => { toggle('2'); }}>
                  Surface Treatment
                </NavLink>
              </NavItem>
            }
            {
              (costingData.TechnologyId !== LOGISTICS && costingData?.TechnologyId !== TOOLING_ID) && <NavItem>
                <NavLink id='Tool_tabs' className={classnames({ active: activeTab === '3' })} onClick={() => { toggle('3'); }}>
                  Tool Cost
                </NavLink>
              </NavItem>
            }
            <NavItem>
              <NavLink id='Packaging_Freight_tabs' className={classnames({ active: activeTab === '4' })} onClick={() => { toggle('4'); }}>
                {costingData?.TechnologyId !== LOGISTICS && 'Packaging &'} Freight
              </NavLink>
            </NavItem>

            {
              costingData.TechnologyId !== LOGISTICS && <NavItem>
                <NavLink id='Overheads_Profits_tabs' className={classnames({ active: activeTab === '5' })} onClick={() => { toggle('5'); }}>
                  Overheads & Profits 
                </NavLink>
              </NavItem>
            }
            {
              costingData.TechnologyId !== LOGISTICS && <NavItem>
                <NavLink id='Discount_Other_tabs' className={classnames({ active: activeTab === '6' })} onClick={() => { toggle('6'); }}>
                  Discount & Other Cost
                </NavLink>
              </NavItem>
            }
          </Nav >
          <PreviousTabData.Provider value={previousTab}>
            <TabContent activeTab={activeTab}>
              <TabPane tabId="1">
                {IdForMultiTechnology.includes(String(costingData?.TechnologyId)) || (costingData.CostingTypeId === WACTypeId) ? <TabAssemblyTechnology
                  setHeaderCost={props.setHeaderCost}
                  backBtn={props.backBtn}
                  activeTab={activeTab}
                  previousTab={previousTab}
                /> :
                  <TabRMCC
                    setHeaderCost={props.setHeaderCost}
                    backBtn={props.backBtn}
                    activeTab={activeTab}
                    previousTab={previousTab}
                  />}
              </TabPane>
              <TabPane tabId="2">
                <TabSurfaceTreatment
                  setHeaderCost={props.setHeaderCostSurfaceTab}
                  activeTab={activeTab}
                  previousTab={previousTab}
                />
              </TabPane>
              <TabPane tabId="5">
                <TabOverheadProfit
                  activeTab={activeTab}
                  setHeaderCost={props.setHeaderOverheadProfitCostTab}
                  headCostRMCCBOPData={props.headCostRMCCBOPData}
                  previousTab={previousTab}
                />
              </TabPane>
              <TabPane tabId="4">
                <TabPackagingFreight
                  activeTab={activeTab}
                  setHeaderCost={props.setHeaderPackageFreightTab}
                  toggle={props.toggle}
                  previousTab={previousTab}
                />
              </TabPane>
              <TabPane tabId="3">
                <TabToolCost
                  activeTab={activeTab}
                  setHeaderCost={props.setHeaderCostToolTab}
                  previousTab={previousTab}
                />
              </TabPane>
              <TabPane tabId="6">
                <TabDiscountOther
                  activeTab={activeTab}
                  setHeaderCost={props.setHeaderDiscountTab}
                  DiscountTabData={props.DiscountTabData}
                  toggle={props.toggle}
                  previousTab={previousTab}
                />
              </TabPane>
            </TabContent>
          </PreviousTabData.Provider>
        </div >
      </div >

      {IsOpenViewHirarchy && <BOMViewer
        isOpen={IsOpenViewHirarchy}
        closeDrawer={closeVisualDrawer}
        isEditFlag={true}
        PartId={costData.PartId}
        anchor={'right'}
        isFromVishualAd={true}
        NewAddedLevelOneChilds={[]}
      />
      }

    </ >
  );
}

//export default connect()(CostingHeaderTabs);
const CostingHeads = connect()(CostingHeaderTabs);
export default CostingHeads;