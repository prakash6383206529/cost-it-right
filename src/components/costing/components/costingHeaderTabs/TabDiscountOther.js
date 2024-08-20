import React, { useContext, useEffect, useRef, useState } from 'react';
import { Controller, useForm, useWatch, } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import {
  getDiscountOtherCostTabData, saveDiscountOtherCostTab, fileUploadCosting, fileDeleteCosting,
  getExchangeRateByCurrency, setDiscountCost, setComponentDiscountOtherItemData, saveAssemblyPartRowCostingCalculation, saveAssemblyBOPHandlingCharge, setDiscountErrors, gridDataAdded, isDiscountDataChange, setNPVData, setPOPrice, resetExchangeRateData, setOtherCostData,
  setOtherDiscountData, getCostingPaymentTermDetail, setDiscountAndOtherCostData, saveCostingPaymentTermDetail, setPaymentTermsDataInDiscountOtherTab, isPaymentTermsDataChange, getCostingTcoDetails, setPaymentTermCost,
  getExternalIntegrationEvaluationType
} from '../../actions/Costing';
import { fetchCostingHeadsAPI, getConditionDetails, getCurrencySelectList, getNpvDetails, saveCostingDetailCondition, saveCostingDetailNpv, } from '../../../../actions/Common';
import { costingInfoContext, netHeadCostContext, NetPOPriceContext } from '../CostingDetailStepTwo';
import { calculatePercentage, checkForDecimalAndNull, checkForNull, loggedInUserId, removeBOPfromApplicability, maxLength20, showSaLineNumber, showBopLabel, getConfigurationKey } from '../../../../helper';
//MINDA
// import {  removeBOPFromList} from '../../../../helper';
import { debounce } from 'lodash';
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css';
import { Redirect, useHistory } from "react-router-dom";
import redcrossImg from '../../../../assests/images/red-cross.png';
import { ATTACHMENT, CAPACITY, CRMHeads, FEASIBILITY, FILE_URL, isShowTaxCode, NFRTypeId, TIMELINE, VBCTypeId, WACTypeId } from '../../../../config/constants';
import { IdForMultiTechnology } from '../../../../config/masterData';
import { MESSAGES } from '../../../../config/message';
import DayTime from '../../../common/DayTimeWrapper';
import Toaster from '../../../common/Toaster';
import { SearchableSelectHookForm, TextAreaHookForm, TextFieldHookForm } from '../../../layout/HookFormInputs';
import { createToprowObjAndSave, errorCheckObject, formatMultiTechnologyUpdate } from '../../CostingUtil';
import { IsNFR, IsPartType, ViewCostingContext } from '../CostingDetails';

import { useMemo } from 'react';
import { reactLocalStorage } from 'reactjs-localstorage';
import { checkWhiteSpaces, decimalNumberLimit6, hashValidation, maxLength80, number, percentageLimitValidation } from "../../../../helper/validation";
import LoaderCustom from '../../../common/LoaderCustom';
import TooltipCustom from '../../../common/Tooltip';
import WarningMessage from '../../../common/WarningMessage';
import Button from '../../../layout/Button';
import { updateMultiTechnologyTopAndWorkingRowCalculation } from '../../actions/SubAssembly';
import AddConditionCosting from '../CostingHeadCosts/AdditionalOtherCost/AddConditionCosting';
import AddOtherDiscount from '../CostingHeadCosts/AdditionalOtherCost/AddOtherDiscount';
import OtherCostDrawer from '../CostingHeadCosts/AdditionalOtherCost/OtherCostDrawer';
import PaymentTerms from '../CostingHeadCosts/OverheadProfit/PaymentTerms';
import AddNpvCost from '../CostingHeadCosts/AdditionalOtherCost/AddNpvCost';
import NpvCost from '../CostingHeadCosts/AdditionalOtherCost/NpvCost';
import { setSAPData } from '../../actions/Approval';

let counter = 0;
function TabDiscountOther(props) {
  // ********* INITIALIZE REF FOR DROPZONE ********
  const dropzone = useRef(null);
  const dropzoneTimeline = useRef(null);
  const dropzoneCapacity = useRef(null);
  const dropzoneFeasibility = useRef(null);
  const { register, handleSubmit, setValue, getValues, formState: { errors }, control } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const [IsCurrencyChange, setIsCurrencyChange] = useState(false);
  const [currency, setCurrency] = useState([]);
  const [files, setFiles] = useState([]);
  const [IsOpen, setIsOpen] = useState(false);
  const [effectiveDate, setEffectiveDate] = useState('');
  const [CurrencyExchangeRate, setCurrencyExchangeRate] = useState('');
  const [otherCostType, setOtherCostType] = useState([]);
  const [hundiscountType, setHundiDiscountType] = useState([])
  const [isDisable, setIsDisable] = useState(false)
  const [npvAcc, setNpvAcc] = useState(false)
  const [conditionAcc, setConditionAcc] = useState(false)
  const [otherCostAcc, setOtherCotAcc] = useState(false)
  const dispatch = useDispatch()
  let history = useHistory();
  const costData = useContext(costingInfoContext);
  const CostingViewMode = useContext(ViewCostingContext);
  const netPOPrice = useContext(NetPOPriceContext);
  const headerCosts = useContext(netHeadCostContext);
  const currencySelectList = useSelector(state => state.comman.currencySelectList)
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)

  const { DiscountCostData, ExchangeRateData, CostingEffectiveDate, RMCCTabData, CostingInterestRateDetail, SurfaceTabData, OverheadProfitTabData, PackageAndFreightTabData, ToolTabData, CostingDataList, getAssemBOPCharge, ErrorObjDiscount, isBreakupBoughtOutPartCostingFromAPI, DiscountAndOtherCostTabData, UpdatePaymentTermCost, checkIsPaymentTermsDataChange, PaymentTermDataDiscountTab, getTcoDetails, IsRfqCostingType } = useSelector(state => state.costing)
  const [totalCost, setTotalCost] = useState(0)
  const [discountObj, setDiscountObj] = useState({})
  const [reRender, setRerender] = useState([])
  const [otherCostApplicability, setOtherCostApplicability] = useState([])
  const [discountCostApplicability, setDiscountCostApplicability] = useState([])
  const [netPoPriceCurrencyState, setNetPoPriceCurrencyState] = useState('')
  const [attachmentLoader, setAttachmentLoader] = useState(false)
  const [isOpenandClose, setisOpenandClose] = useState(false)
  const [isConditionCostingOpen, setIsConditionCostingOpen] = useState(false)
  const costingHead = useSelector(state => state.comman.costingHead)
  const partType = (IdForMultiTechnology.includes(String(costData?.TechnologyId)) || costData.CostingTypeId === WACTypeId)
  const [showWarning, setShowWarning] = useState(false)
  const [isInputLoader, setIsInputLader] = useState(false)
  const [npvTableData, setNpvTableData] = useState([])
  const [conditionTableData, seConditionTableData] = useState([])
  const [totalNpvCost, setTotalNpvCost] = useState(0)
  const [totalConditionCost, setTotalConditionCost] = useState(0)
  const [nfrListing, setNfrListing] = useState(false)
  const [openCloseOtherCost, setOpenCloseOtherCost] = useState(false)
  const [openCloseOtherDiscount, setOpenCloseOtherDiscount] = useState(false)
  const { subAssemblyTechnologyArray } = useSelector(state => state.subAssembly)
  const { otherCostData, otherDiscountData } = useSelector(state => state.costing)
  const [capacityFiles, setCapacityFiles] = useState([]);
  const [timelineFiles, setTimelineFiles] = useState([]);
  const [initialFiles, setInitialFiles] = useState([]);
  const [feasibilityFiles, setFeasibilityFiles] = useState([]);
  const [IsOpenTimeline, setIsOpenTimeline] = useState(false);
  const [IsOpenCapacity, setIsOpenCapacity] = useState(false);
  const [IsOpenFeasibility, setIsOpenFeasibility] = useState(false);
  const [apiCallCounterFeasibility, setApiCallCounterFeasibility] = useState(0);
  const [apiCallCounterCapacity, setApiCallCounterCapacity] = useState(0);
  const [apiCallCounterTimeline, setApiCallCounterTimeline] = useState(0);
  const [countFeasibility, setCountFeasibility] = useState(0);
  const [countCapacity, setCountCapacity] = useState(0);
  const [countTimeline, setCountTimeline] = useState(0);
  const [apiCallCounter, setApiCallCounter] = useState(0)
  const [attachmentAcc, setAttachmentAcc] = useState(false)
  const [isRfqAttachment, setIsRfqAttachement] = useState(false)
  const [attachmentLoaderObj, setAttachmentLoaderObj] = useState({
    loaderAttachment: false,
    loaderFeasibility: false,
    loaderCapacity: false,
    loaderTimeline: false,
  })
  const npvDrawerCondition = (
    ((IsRfqCostingType?.costingType || IsRfqCostingType?.isRfqCosting) && !initialConfiguration?.IsShowTCO && initialConfiguration?.IsShowNpvCost) ||
    (!(IsRfqCostingType?.costingType || IsRfqCostingType?.isRfqCosting) && initialConfiguration?.IsShowTCO && initialConfiguration?.IsShowNpvCost) ||
    (!(IsRfqCostingType?.costingType || IsRfqCostingType?.isRfqCosting) && !initialConfiguration?.IsShowTCO && initialConfiguration?.IsShowNpvCost)
  );

  const shouldRenderNpvDrawer = !(
    (!IsRfqCostingType?.costingType && !initialConfiguration?.IsShowTCO && !initialConfiguration?.IsShowNpvCost) ||
    (IsRfqCostingType?.costingType && !initialConfiguration?.IsShowTCO && !initialConfiguration?.IsShowNpvCost)
  );


  const [otherCostArray, setOtherCostArray] = useState([])
  const [discountCostArray, setDiscountCostArray] = useState([])
  const [costingConditionEntryType, setCostingConditionEntryType] = useState('')
  const isNFR = useContext(IsNFR);
  const isPartType = useContext(IsPartType);
  const [paymentTerms, setPaymentTerms] = useState(false)
  const [paymentTermsWarning, setPaymentTermsWarning] = useState(false)
  const { getCostingPaymentDetails } = useSelector(state => state.costing);
  const { evaluationType } = useSelector((state) => state?.costing)


  const SAPData = useSelector(state => state.approval.SAPObj)


  const fieldValues = useWatch({
    control,
    name: ['Remarks', 'Currency'],
  });

  useEffect(() => {
    // CostingViewMode CONDITION IS USED TO AVOID CALCULATION IN VIEWMODE
    if (CostingViewMode === false) {
      if (props.activeTab !== '6') {
        // Basic Rate (INR) = Total Cost + Total Other Cost
        setValue('BasicRateINR', discountObj !== undefined && checkForDecimalAndNull((checkForNull(netPOPrice) - checkForNull(otherDiscountData.totalCost) - (checkForNull(totalNpvCost) + checkForNull(totalConditionCost))), initialConfiguration?.NoOfDecimalForPrice))
        setValue('NetPOPriceINR', discountObj !== undefined && checkForDecimalAndNull((checkForNull(netPOPrice) - checkForNull(netPOPrice) * calculatePercentage(discountObj?.HundiOrDiscountPercentage)), initialConfiguration?.NoOfDecimalForPrice))
        setValue('HundiOrDiscountPercentage', discountObj !== undefined && discountObj?.HundiOrDiscountPercentage !== null ? discountObj?.HundiOrDiscountPercentage : '')
        // setValue('HundiOrDiscountValue', discountObj !== undefined && discountObj?.DiscountCostType === 'Percentage' ? discountObj !== undefined && (netPOPrice * calculatePercentage(discountObj?.HundiOrDiscountPercentage)) : otherDiscountData.otherCostTotal)
        setValue('AnyOtherCost', discountObj !== undefined && checkForDecimalAndNull(discountObj?.AnyOtherCost, initialConfiguration.NoOfDecimalForPrice))
        let topHeaderData = {
          DiscountsAndOtherCost: checkForNull(otherDiscountData.totalCost),
          HundiOrDiscountPercentage: getValues('HundiOrDiscountPercentage'),
          AnyOtherCost: checkForNull(discountObj.AnyOtherCost),
          DiscountCostType: discountObj !== undefined && discountObj?.DiscountCostType,
          HundiOrDiscountValue: discountObj && checkForDecimalAndNull(otherDiscountData.totalCost !== null ? otherDiscountData.totalCost : '', initialConfiguration?.NoOfDecimalForPrice),
          DiscountApplicability: discountObj && discountObj?.DiscountApplicability,
          totalNpvCost: discountObj?.totalNpvCost ? discountObj?.totalNpvCost : totalNpvCost,
          totalConditionCost: discountObj?.totalConditionCost ? discountObj?.totalConditionCost : totalConditionCost,
        }
        props.setHeaderCost(topHeaderData, headerCosts, costData)
      }
    }
  }, [netPOPrice])
  useEffect(() => {
    dispatch(getCostingTcoDetails(costData?.CostingId, () => { }))

  }, [costData?.CostingId])
  const handleOtherDiscountDrawer = () => {
    setOpenCloseOtherDiscount(!openCloseOtherDiscount)
  }

  useEffect(() => {
    let request = partType ? 'multiple technology assembly' : ''
    dispatch(fetchCostingHeadsAPI(request, false, (res) => { }))
    if (getConfigurationKey().IsSAPConfigured) {

      let data = {
        plantCode: costData?.PlantCode,
        partNumber: costData?.PartNumber
      }

      dispatch(getExternalIntegrationEvaluationType(data, res => { }))
    }
  }, [])
  useEffect(() => {
    dispatch(getCostingPaymentTermDetail(costData?.CostingId, (res) => {

    }))
  }, [costData])
  const viewAddButtonIcon = (data, type) => {

    let className = ''
    let title = ''
    if (data.length !== 0 || CostingViewMode) {
      className = 'view-icon-primary'
      title = 'View'
    } else {
      className = 'plus-icon-square'
      title = 'Add'
    }
    if (type === "className") {
      return className
    } else if (type === "title") {
      return title
    }
  }

  const otherCostUI = useMemo(() => {
    let otherCost = otherCostData.otherCostTotal
    setValue('OtherCost', checkForDecimalAndNull(otherCost, initialConfiguration.NoOfDecimalForPrice))
    return <div className='d-flex align-items-center'>
      <TextFieldHookForm
        label="Other Cost"
        name={'OtherCost'}
        Controller={Controller}
        id="otherCost"
        control={control}
        register={register}
        mandatory={false}
        rules={{}}
        handleChange={() => { }}
        defaultValue={otherCost}
        className=""
        customClassName={'withBorder w-100'}
        errors={errors.OtherCost}
        disabled={true}
      />
      <Button
        id="tabDiscount_otherCost"
        onClick={() => handleOtherCostdrawer()}
        className={"right mt15"}
        variant={viewAddButtonIcon(otherCostData.gridData, "className")}
        title={viewAddButtonIcon(otherCostData.gridData, "title")}
      />
    </div>
  }, [otherCostData])
  const npvCostUI = useMemo(() => {

    const sum = npvTableData.reduce((acc, obj) => Number(acc) + Number(obj.NpvCost), 0);
    setValue('NPVCost', checkForDecimalAndNull(sum, initialConfiguration?.NoOfDecimalForPrice))
    return <div className='d-flex align-items-center'>
      <TextFieldHookForm
        label="NPV Cost"
        name={'NPVCost'}
        Controller={Controller}
        id="npvCost"
        control={control}
        register={register}
        mandatory={false}
        rules={{}}
        handleChange={() => { }}
        defaultValue={sum}
        className=""
        customClassName={'withBorder w-100'}
        errors={errors.NPVCost}
        disabled={true}
      />
      <Button
        id="tabDiscount_npvCost"
        onClick={() => openAndCloseAddNpvDrawer('Open')}
        className={"right mt-2"}
        variant={viewAddButtonIcon(npvTableData, "className")}
        title={viewAddButtonIcon(npvTableData, "title")}
      />
    </div>
  }, [npvTableData])

  const otherDiscountUI = useMemo(() => {
    let totalDiscount = otherDiscountData.totalCost
    setValue('HundiOrDiscountValue', checkForDecimalAndNull(totalDiscount, initialConfiguration.NoOfDecimalForPrice))
    return <div className='d-flex align-items-center'>
      <TooltipCustom disabledIcon={true} width="280px" id="totalDiscountCost" tooltipText={"Discount Cost = Sum of Discount cost added in Discount cost drawer"} />
      <TextFieldHookForm
        label="Hundi/Discount Value"
        name={'HundiOrDiscountValue'}
        Controller={Controller}
        control={control}
        id="totalDiscountCost"
        register={register}
        mandatory={false}
        rules={{
          validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
        }}
        handleChange={(e) => {
          e.preventDefault();
          handleDiscountCostChange(e);
        }}
        defaultValue={""}
        className=""
        customClassName={'withBorder w-100'}
        errors={errors.HundiOrDiscountValue}
        disabled={true}
      />
      <Button
        id="tabDiscount_otherCost"
        onClick={handleOtherDiscountDrawer}
        className={"right mt15"}
        variant={viewAddButtonIcon(otherDiscountData.gridData, "className")}
        title={viewAddButtonIcon(otherDiscountData.gridData, "title")}
      />
    </div>
  }, [otherDiscountData])


  const costingConditionUI = useMemo(() => {
    const sum = conditionTableData.reduce((acc, obj) => checkForNull(acc) + checkForNull(obj.ConditionCostPerQuantity), 0);
    console.log('conditionTableData: ', conditionTableData);
    setValue('ConditionCosting', checkForDecimalAndNull(sum, initialConfiguration.NoOfDecimalForPrice))
    setValue('TaxCode', conditionTableData[0]?.Description)

    return <Col md="3">
      <div className='d-flex align-items-center'>
        {
          isShowTaxCode ?
            <TextFieldHookForm
              label="Tax Code"
              name={'TaxCode'}
              Controller={Controller}
              id="TaxCode"
              control={control}
              register={register}
              mandatory={true}
              rules={{ required: true }}
              handleChange={() => { }}
              defaultValue={''}
              className=""
              customClassName={'withBorder w-100'}
              errors={errors.TaxCode}
              disabled={true}
            /> :
            <>

              <TooltipCustom disabledIcon={true} width="280px" id="costingCondition" tooltipText={"Condition Cost = Sum of condition cost added in condition drawer"} />
              <TextFieldHookForm
                label="Condition"
                name={'ConditionCosting'}
                Controller={Controller}
                id="costingCondition"
                control={control}
                register={register}
                mandatory={false}
                rules={{}}
                handleChange={() => { }}
                defaultValue={sum}
                className=""
                customClassName={'withBorder w-100'}
                errors={errors.ConditionCosting}
                disabled={true}
              />
            </>
        }

        <Button
          id="tabDiscount_condition"
          onClick={() => openAndCloseAddConditionCosting('Open')}
          className={"right mt15"}
          variant={viewAddButtonIcon(conditionTableData, "className")}
          title={viewAddButtonIcon(conditionTableData, "title")}
        />
      </div>
    </Col>
  }, [conditionTableData])



  useEffect(() => {
    dispatch(getCurrencySelectList(() => { }))
    return () => {
      reactLocalStorage.setObject('isFromDiscountObj', false)
      setNfrListing(false)
    }
  }, [])

  useEffect(() => {
    setDiscountObj({
      ...discountObj,
      paymentTermCost: UpdatePaymentTermCost?.NetCost
    })
  }, [UpdatePaymentTermCost])
  useEffect(() => {
    if (RMCCTabData && RMCCTabData[0]?.CostingId && props?.activeTab === '6') {
      let npvSum = 0
      if (initialConfiguration?.IsShowNpvCost || initialConfiguration?.IsShowTCO) {
        dispatch(getNpvDetails(RMCCTabData && RMCCTabData[0]?.CostingId, (res) => {
          if (res?.data?.DataList) {
            let Data = res?.data?.DataList
            setNpvTableData(Data)
            const sum = Data.reduce((acc, obj) => checkForNull(acc) + checkForNull(obj.NpvCost), 0);
            setTotalNpvCost(sum)
            npvSum = sum
            dispatch(isDiscountDataChange(true))
            setDiscountObj({
              ...discountObj,
              totalNpvCost: sum,
            })
          }
        }))
      }

      if (initialConfiguration?.IsBasicRateAndCostingConditionVisible || isShowTaxCode) {
        dispatch(getConditionDetails(RMCCTabData && RMCCTabData[0]?.CostingId, (res) => {
          if (res?.data?.Data) {
            let Data = res?.data?.Data.ConditionsData
            let temp = []
            Data && Data.map((item) => {
              // item.ConditionPercentage = item.Percentage
              item.Description = `${item.Description} (${item.CostingConditionNumber})`
              temp.push(item)
            })
            setCostingConditionEntryType(res?.data?.Data.CostingConditionEntryTypeId)
            seConditionTableData(temp)
            const sum = Data.reduce((acc, obj) => checkForNull(acc) + checkForNull(obj.ConditionCost), 0);
            setTotalConditionCost(sum)
            setTimeout(() => {
              dispatch(isDiscountDataChange(true))
              setDiscountObj({
                ...discountObj,
                totalConditionCost: checkForNull(sum)
              })
            }, 1000);
          }
        }))
      }
    }

    return () => {
      setNpvTableData([])
      seConditionTableData([])
    }
  }, [RMCCTabData, props.activeTab])


  useEffect(() => {
    if (CostingDataList && CostingDataList.length > 0) {
      let dataList = CostingDataList[0]
      const total = checkForNull(dataList.NetTotalRMBOPCC) + checkForNull(dataList.NetSurfaceTreatmentCost) + checkForNull(dataList.NetOverheadAndProfitCost) + checkForNull(dataList.NetPackagingAndFreight) + checkForNull(dataList.ToolCost)
      setTotalCost(total)
      const discountValues = {
        ...DiscountCostData,
        totalCost: total,
        paymentTermCost: UpdatePaymentTermCost?.NetCost

      }

      dispatch(setDiscountCost(discountValues, () => { }))
      //dispatch(setDiscountCost({ ...discountObj, totalCost: total }, () => { }));
    }

  }, [])

  //USED TO SET ITEM DATA THAT WILL CALL WHEN CLICK ON OTHER TAB
  useEffect(() => {

    dispatch(setComponentDiscountOtherItemData({}, () => { }))
    dispatch(setPaymentTermsDataInDiscountOtherTab({}, () => { }))
    // setTimeout(() => {
    let tempFiles = [...feasibilityFiles, ...capacityFiles, ...timelineFiles]
    let updatedFiles = tempFiles.map((file) => {
      return { ...file, ContextId: costData.CostingId }
    })
    let updatedFilesAttachment = files.map((file) => {
      return { ...file, ContextId: costData.CostingId }
    })

    let otherCostFinalArray = []
    Array.isArray(otherCostArray) && otherCostArray.map(item => {
      let data1 = {
        "Type": 'Other',
        "ApplicabilityType": item?.OtherCostApplicability,
        "ApplicabilityIdRef": item?.OtherCostApplicabilityId,
        "ApplicabilityCost": item?.ApplicabilityCost,
        "Description": item?.OtherCostDescription,
        "NetCost": item?.AnyOtherCost,
        "Value": item?.PercentageOtherCost,
        "CRMHead": item?.CRMHead,
      }
      otherCostFinalArray.push(data1)
    })

    let discountArray = [
      {
        "Type": 'Discount',
        "ApplicabilityType": discountCostApplicability?.label,
        "ApplicabilityIdRef": discountCostApplicability?.value,
        "Description": getValues('discountDescriptionRemark'),
        "NetCost": DiscountCostData?.HundiOrDiscountValue,
        "Value": getValues('HundiOrDiscountPercentage'),
        "CRMHead": getValues('crmHeadDiscount') ? getValues('crmHeadDiscount').label : '',
      }
    ]

    let data = {
      "CostingId": costData?.CostingId,
      "PartId": costData?.PartId,
      "PartNumber": costData?.PartNumber,
      "NetPOPrice": checkForNull(netPOPrice),
      "TotalCost": checkForNull(netPOPrice),
      "LoggedInUserId": loggedInUserId(),
      "EffectiveDate": CostingEffectiveDate,
      "BasicRate": checkForNull(netPOPrice) - (checkForNull(totalNpvCost) + checkForNull(totalConditionCost)),
      "CurrencyId": currency?.value,
      "Currency": currency?.label,
      "IsChangeCurrency": IsCurrencyChange,
      "NetPOPriceInOtherCurrency": netPoPriceCurrencyState,
      "CurrencyExchangeRate": CurrencyExchangeRate,
      "Remark": getValues('Remarks'),

      "CostingPartDetails": {

        "CostingDetailId": costData?.CostingId,
        "PartId": costData?.PartId,
        "PartTypeId": "00000000-0000-0000-0000-000000000000",
        "Type": costData?.VendorType,
        "PartNumber": costData?.PartNumber,
        "PartName": costData?.PartName,
        "Quantity": 1,
        "IsOpen": true,
        "IsPrimary": true,
        "Sequence": '0',
        "NetDiscountsCost": DiscountCostData?.HundiOrDiscountValue,
        "TotalCost": checkForNull(netPOPrice),
        "NetOtherCost": DiscountCostData?.AnyOtherCost,
        "OtherCostDetails": otherCostFinalArray,
        "DiscountCostDetails": discountArray,
        "NetNpvCost": checkForNull(totalNpvCost),
        "NetConditionCost": checkForNull(totalConditionCost),
      },
      "SANumber": getValues('SANumber'),
      "LineNumber": getValues('LineNumber'),
      "ValuationType": SAPData?.evaluationType,
      "IsValuationValid": SAPData?.isValuationValid,
      "Attachements": updatedFiles,
      "IsChanged": true,
    }
    let PaymentTermobj = {
      "LoggedInUserId": loggedInUserId(),
      "BaseCostingId": costData?.CostingId,
      "NetPaymentTermCost": DiscountAndOtherCostTabData ? DiscountAndOtherCostTabData?.NetCost : 0,
      "IsPaymentTerms": true,
      "PaymentTermDetail": {
        "InterestRateId": DiscountAndOtherCostTabData ? DiscountAndOtherCostTabData?.InterestRateId : "",
        "PaymentTermDetailId": "",
        "PaymentTermApplicability": DiscountAndOtherCostTabData ? DiscountAndOtherCostTabData?.PaymentTermApplicability : "",
        "RepaymentPeriod": DiscountAndOtherCostTabData ? DiscountAndOtherCostTabData?.RepaymentPeriod : 0,
        "InterestRate": DiscountAndOtherCostTabData ? DiscountAndOtherCostTabData?.InterestRate : 0,
        "NetCost": DiscountAndOtherCostTabData ? DiscountAndOtherCostTabData?.NetCost : 0,
        "EffectiveDate": DiscountAndOtherCostTabData ? DiscountAndOtherCostTabData?.EffectiveDate : "",
        "PaymentTermCRMHead": DiscountAndOtherCostTabData ? DiscountAndOtherCostTabData?.PaymentTermCRMHead : "",
        "Remark": DiscountAndOtherCostTabData ? DiscountAndOtherCostTabData?.Remark : ""
      }
    };

    dispatch(setComponentDiscountOtherItemData(data, () => { }))
    dispatch(setPaymentTermsDataInDiscountOtherTab(PaymentTermobj, () => { }))

    // }, 1000)
  }, [DiscountCostData, fieldValues])
  const filterAttachments = (list, value) => {
    let filteredList = list?.filter(element => element.AttachementCategory === value)
    return filteredList
  }
  useEffect(() => {
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: costData.CostingId,
        PartId: costData.PartId,
      }

      dispatch(getDiscountOtherCostTabData(data, (res) => {
        if (res && res.data && res.data.Result) {
          let Data = res.data.Data;


          if (Data && Data?.CostingPartDetails && Data?.CostingPartDetails?.GrandTotalCost !== null) {
            let costDetail = Data?.CostingPartDetails
            let attachmentList = filterAttachments(Data.Attachements, null)
            let attachmentFeasibility = filterAttachments(Data.Attachements, FEASIBILITY)
            let attachmentCapacity = filterAttachments(Data.Attachements, CAPACITY)
            let attachmentTimeline = filterAttachments(Data.Attachements, TIMELINE)
            setIsRfqAttachement(Data.Attachements.length !== attachmentList.length)

            setIsCurrencyChange(Data.IsChangeCurrency ? true : false)
            setCurrencyExchangeRate(Data.CurrencyExchangeRate)
            setFiles(attachmentList ? attachmentList : [])
            setFeasibilityFiles(attachmentFeasibility ? attachmentFeasibility : [])
            setCapacityFiles(attachmentCapacity ? attachmentCapacity : [])
            setTimelineFiles(attachmentTimeline ? attachmentTimeline : [])
            setEffectiveDate(DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '')
            setCurrency(Data.Currency !== null ? { label: Data.Currency, value: Data.CurrencyId } : [])
            setValue('BasicRateINR', Data.BasicRate !== null ? checkForDecimalAndNull(Data.BasicRate, initialConfiguration?.NoOfDecimalForPrice) : '')
            setValue('NetPOPriceINR', Data.NetPOPrice !== null ? checkForDecimalAndNull(Data.NetPOPrice, initialConfiguration?.NoOfDecimalForPrice) : '')
            setValue('Currency', Data.Currency !== null ? { label: Data.Currency, value: Data.CurrencyId } : [])
            setValue('NetPOPriceOtherCurrency', Data.NetPOPriceInOtherCurrency !== null ? checkForDecimalAndNull(Data.NetPOPriceInOtherCurrency, initialConfiguration?.NoOfDecimalForPrice) : '')
            setValue('Remarks', Data.Remark !== null ? Data.Remark : '')
            //MINDA
            setValue('SANumber', Data.SANumber !== null ? Data.SANumber : '')
            setValue('LineNumber', Data.LineNumber !== null ? Data.LineNumber : '')
            setValue("evaluationType", Data?.ValuationType ? { label: Data?.ValuationType, value: Data?.ValuationType } : "")

            dispatch(setSAPData({ ...SAPData, evaluationType: Data?.ValuationType ?? '', isValuationValid: Data?.IsValuationValid ?? false }))

            setEffectiveDate(DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '')
            setValue('AnyOtherCost', costDetail.NetOtherCost !== null ? checkForDecimalAndNull(costDetail.NetOtherCost, initialConfiguration?.NoOfDecimalForPrice) : '')
            setNetPoPriceCurrencyState(Data.NetPOPriceInOtherCurrency !== null ? Data.NetPOPriceInOtherCurrency : '')
            setValue('discountDescriptionRemark', Data !== undefined && Data?.CostingPartDetails?.DiscountCostDetails[0]?.Description)
            if (costDetail?.DiscountCostDetails?.length !== 0) {
              setValue('HundiOrDiscountPercentage', costDetail?.DiscountCostDetails[0]?.Value !== null ? costDetail?.DiscountCostDetails[0]?.Value : '')
              setValue('HundiOrDiscountValue', costDetail?.DiscountCostDetails[0]?.NetCost !== null ? checkForDecimalAndNull(costDetail?.DiscountCostDetails[0]?.NetCost, initialConfiguration?.NoOfDecimalForPrice) : '')
            }
            let temp = []
            let otherTotalCost = 0
            Data?.CostingPartDetails?.OtherCostDetails && Data?.CostingPartDetails?.OtherCostDetails.map((item) => {
              otherTotalCost = checkForNull(otherTotalCost) + checkForNull(item.NetCost)
              let obj = {}
              obj.OtherCostDescription = item.Description
              obj.OtherCostApplicability = item.ApplicabilityType
              obj.PercentageOtherCost = item.Value ? item.Value : '-'
              obj.AnyOtherCost = item.NetCost
              obj.ApplicabilityCost = item?.ApplicabilityCost
              obj.CRMHead = item?.CRMHead
              temp.push(obj)
            })
            setOtherCostArray(temp)
            let discountTemp = [];
            let discountTotalCost = 0
            Data?.CostingPartDetails?.DiscountCostDetails && Data?.CostingPartDetails?.DiscountCostDetails.map((item) => {
              let obj = {}
              discountTotalCost = checkForNull(discountTotalCost) + checkForNull(item.NetCost)
              obj.Description = item.Description
              obj.ApplicabilityIdRef = item.ApplicabilityIdRef
              obj.applicability = item.ApplicabilityType
              obj.ApplicabilityCost = item?.ApplicabilityCost
              obj.PercentageDiscountCost = item.Value ? item.Value : '-'
              obj.NetCost = item.NetCost
              obj.CRMHead = item?.CRMHead
              discountTemp.push(obj)
            })
            setDiscountCostArray(discountTemp)

            dispatch(setOtherCostData({ gridData: temp, otherCostTotal: otherTotalCost }))
            dispatch(setOtherDiscountData({ gridData: discountTemp, totalCost: discountTotalCost }))
            costDetail?.DiscountCostDetails && setDiscountCostApplicability({ label: costDetail?.DiscountCostDetails[0]?.ApplicabilityType, value: costDetail?.DiscountCostDetails[0]?.ApplicabilityType })
            costDetail?.DiscountCostDetails && setValue('DiscountCostApplicability', { label: costDetail?.DiscountCostDetails[0]?.ApplicabilityType, value: costDetail?.DiscountCostDetails[0]?.ApplicabilityType })
            costDetail?.DiscountCostDetails && setValue('crmHeadDiscount', { label: costDetail?.DiscountCostDetails[0]?.CRMHead, value: 1 })

            // BELOW CONDITION UPDATES VALUES IN EDIT OR GET MODE
            const discountValues = {
              BasicRateINR: Data.BasicRate !== null ? checkForNull(Data.BasicRate) : '',
              NetPOPriceINR: Data.NetPOPrice !== null ? checkForNull(Data.NetPOPrice) : '',

              HundiOrDiscountValue: costDetail?.DiscountCostDetails && costDetail?.DiscountCostDetails[0]?.NetCost !== null ? checkForNull(costDetail?.DiscountCostDetails[0]?.NetCost) : '',
              AnyOtherCost: costDetail.NetOtherCost !== null ? checkForNull(costDetail.NetOtherCost) : '',
              HundiOrDiscountPercentage: costDetail?.DiscountCostDetails && costDetail?.DiscountCostDetails[0]?.Value !== null ? checkForNull(costDetail?.DiscountCostDetails[0]?.Value) : '',
              //DiscountCostType: OtherCostDetails.DiscountCostType !== null ? OtherCostDetails.DiscountCostType : '',
              // OtherCostApplicability: OtherCostDetails.OtherCostApplicability,
              DiscountApplicability: costDetail?.DiscountCostDetails ? costDetail?.DiscountCostDetails[0]?.ApplicabilityType : '',
              totalNpvCost: discountObj?.totalNpvCost ? discountObj?.totalNpvCost : costDetail?.NetNpvCost,
              totalConditionCost: discountObj?.totalConditionCost ? discountObj?.totalConditionCost : costDetail?.NetConditionCost,
            }
            dispatch(setDiscountCost(discountValues, () => { }))

            // setTimeout(() => {           // IF ANY ISSUE COME IN DISCOUNT TAB UNCOMMENT THE SETTIMEOUT ON FIRST PRIORITY AND TEST 
            let topHeaderData = {
              ...Data, ...Data?.CostingPartDetails,
              DiscountsAndOtherCost: costDetail?.DiscountCostDetails ? checkForNull(costDetail?.DiscountCostDetails[0]?.NetCost) : '',
              HundiOrDiscountPercentage: getValues('HundiOrDiscountPercentage'),
              AnyOtherCost: checkForNull(costDetail.NetOtherCost),
              // OtherCostType: OtherCostDetails.OtherCostType,
              // PercentageOtherCost: checkForNull(OtherCostDetails.PercentageOtherCost),
              HundiOrDiscountValue: costDetail?.DiscountCostDetails && checkForNull(costDetail?.DiscountCostDetails[0]?.NetCost !== null ? costDetail?.DiscountCostDetails[0]?.NetCost : ''),
              //DiscountCostType: OtherCostDetails.DiscountCostType !== null ? OtherCostDetails.DiscountCostType : '',
              // OtherCostApplicability: OtherCostDetails.OtherCostApplicability,
              DiscountApplicability: costDetail?.DiscountCostDetails ? costDetail?.DiscountCostDetails[0]?.ApplicabilityType : '',
              totalNpvCost: discountObj?.totalNpvCost ? discountObj?.totalNpvCost : costDetail?.NetNpvCost,
              totalConditionCost: discountObj?.totalConditionCost ? discountObj?.totalConditionCost : costDetail?.NetConditionCost,
            }
            setDiscountObj(topHeaderData)
            props.setHeaderCost(topHeaderData, headerCosts, costData)
            // ********** ADD ATTACHMENTS FROM API INTO THE DROPZONE'S PERSONAL DATA STORE **********
            let files = Data.Attachements && Data.Attachements.map((item) => {
              item.meta = {}
              item.meta.id = item.FileId
              item.meta.status = 'done'
              return item
            })
            if (dropzone.current !== null) {
              dropzone.current.files = files
            }
            // }, 1500)
          }
        }
      }))
    }
  }, [costData]);


  useEffect(() => {
    // BELOW CONDITION UPDATES VALUES IN EDIT OR GET MODE
    const discountValues = {
      BasicRateINR: discountObj?.NetPOPriceINR !== null ? checkForNull(discountObj?.NetPOPriceINR) - checkForNull(totalNpvCost) + checkForNull(totalConditionCost) : '',
      NetPOPriceINR: discountObj?.NetPOPriceINR !== null ? checkForNull(discountObj?.NetPOPriceINR) : '',
      HundiOrDiscountValue: otherDiscountData.totalCost !== null ? checkForNull(otherDiscountData.totalCost) : '',
      AnyOtherCost: discountObj?.AnyOtherCost !== null ? checkForNull(discountObj?.AnyOtherCost) : '',
      HundiOrDiscountPercentage: discountObj?.HundiOrDiscountPercentage !== null ? checkForNull(discountObj?.HundiOrDiscountPercentage) : '',
      DiscountCostType: discountObj?.DiscountCostType !== null ? discountObj?.DiscountCostType : '',
      // OtherCostApplicability: discountObj?.OtherCostApplicability,
      DiscountApplicability: discountObj?.DiscountApplicability,
      totalNpvCost: discountObj?.totalNpvCost ? discountObj?.totalNpvCost : totalNpvCost,
      totalConditionCost: discountObj?.totalConditionCost ? discountObj?.totalConditionCost : totalConditionCost,
    }
    dispatch(setDiscountCost(discountValues, () => { }))

    setTimeout(() => {
      let topHeaderData = {
        DiscountsAndOtherCost: checkForNull(otherDiscountData.totalCost),
        HundiOrDiscountPercentage: getValues('HundiOrDiscountPercentage'),
        AnyOtherCost: checkForNull(discountObj?.AnyOtherCost),
        // OtherCostType: discountObj?.OtherCostType,
        // PercentageOtherCost: checkForNull(discountObj?.PercentageOtherCost),
        HundiOrDiscountValue: checkForNull(otherDiscountData.totalCost !== null ? otherDiscountData.totalCost : ''),
        DiscountCostType: discountObj?.DiscountCostType !== null ? discountObj?.DiscountCostType : '',
        // OtherCostApplicability: discountObj?.OtherCostApplicability,
        DiscountApplicability: discountObj?.DiscountApplicability,
        totalNpvCost: discountObj?.totalNpvCost ? discountObj?.totalNpvCost : totalNpvCost,
        totalConditionCost: discountObj?.totalConditionCost ? discountObj?.totalConditionCost : totalConditionCost,
      }
      props.setHeaderCost(topHeaderData, headerCosts, costData)
    })
  }, [costData, headerCosts])

  //MANIPULATE TOP HEADER COSTS
  useEffect(() => {
    if (!CostingViewMode) {


      setValue('BasicRateINR', DiscountCostData && checkForDecimalAndNull(checkForNull(netPOPrice) - (checkForNull(totalNpvCost) + checkForNull(totalConditionCost)), initialConfiguration?.NoOfDecimalForPrice))

      setValue('NetPOPriceINR', DiscountCostData && checkForDecimalAndNull(netPOPrice, initialConfiguration?.NoOfDecimalForPrice))
      // if (otherCostType.value === 'Percentage') {
      //   setValue('AnyOtherCost', DiscountCostData !== undefined ? checkForDecimalAndNull(DiscountCostData.AnyOtherCost, initialConfiguration?.NoOfDecimalForPrice) : 0)
      // }
      // if (hundiscountType.value === 'Percentage') {
      //   setValue('HundiOrDiscountValue', DiscountCostData && checkForDecimalAndNull(DiscountCostData.HundiOrDiscountValue, initialConfiguration?.NoOfDecimalForPrice))
      // }
      if (IsCurrencyChange && ExchangeRateData && ExchangeRateData !== undefined && ExchangeRateData.CurrencyExchangeRate !== undefined) {
        let poPriceOtherCurrency = (getValues('Currency') === '') ? 0 : (DiscountCostData && netPOPrice / ExchangeRateData.CurrencyExchangeRate)
        setValue('NetPOPriceOtherCurrency', checkForDecimalAndNull(poPriceOtherCurrency, initialConfiguration?.NoOfDecimalForPrice))
        setNetPoPriceCurrencyState(DiscountCostData && netPOPrice / ExchangeRateData.CurrencyExchangeRate)
      }
    }

  }, [props]);

  /**
  * @method handleDiscountChange
  * @description HANDLE DISCOUNT CHANGE
  */
  const handleDiscountChange = (event) => {
    if (!CostingViewMode) {
      if (!isNaN(event.target.value)) {

        // let topHeaderData = {
        //   DiscountsAndOtherCost: checkForDecimalAndNull(getValues('HundiOrDiscountValue'), initialConfiguration.NoOfDecimalForPrice),
        //   HundiOrDiscountPercentage: checkForNull(event.target.value),
        //   AnyOtherCost: checkForNull(getValues('AnyOtherCost')),
        //   DiscountCostType: hundiscountType.value
        // }
        // props.setHeaderCost(topHeaderData)

        setDiscountObj({
          ...discountObj,
          HundiOrDiscountPercentage: checkForNull(event.target.value)
        })

      } else {
        Toaster.warning('Please enter valid number.')
      }
    }
  }

  const setValueForTopHeader = () => {
    let topHeaderData = {
      DiscountsAndOtherCost: checkForNull(otherDiscountData.totalCost),
      HundiOrDiscountPercentage: checkForNull(discountObj?.HundiOrDiscountPercentage),
      AnyOtherCost: checkForNull(discountObj?.AnyOtherCost),
      // OtherCostType: otherCostType?.value,
      PercentageOtherCost: checkForNull(discountObj?.OtherCostPercentage),
      DiscountCostType: hundiscountType.value,
      // OtherCostApplicability: discountObj?.OtherCostApplicability,
      DiscountApplicability: discountObj?.DiscountApplicability,
      totalNpvCost: discountObj?.totalNpvCost ? discountObj?.totalNpvCost : totalNpvCost,
      totalConditionCost: discountObj?.totalConditionCost ? discountObj?.totalConditionCost : totalConditionCost,
    }
    props.setHeaderCost(topHeaderData, headerCosts, costData)

  }

  useEffect(() => {
    setValueForTopHeader()
  }, [discountObj])

  /**
  * @method handleAnyOtherCostChange
  * @description HANDLE ANY OTHER COST CHANGE
  */
  const handleAnyOtherCostChange = (event) => {
    if (!CostingViewMode) {
      if (!isNaN(event.target.value)) {
        dispatch(isDiscountDataChange(true))
        setDiscountObj({
          ...discountObj,
          AnyOtherCost: event.target.value
        })
      } else {
        Toaster.warning('Please enter valid number.')
      }
    }
  }
  /**
  * @method handleAnyOtherCostChange
  * @description HANDLE ANY OTHER COST CHANGE
  */
  const handleDiscountCostChange = (event) => {
    if (!CostingViewMode) {
      if (!isNaN(event.target.value)) {
        dispatch(isDiscountDataChange(true))
        if (checkForNull(event.target.value) > totalCost) {
          setTimeout(() => {
            setValue('HundiOrDiscountValue', 0)
          }, 300);
          setDiscountObj({
            ...discountObj,
            HundiOrDiscountValue: 0,
            totalCost: totalCost
          })
          errors.HundiOrDiscountValue = {}
          Toaster.warning("Hundi/Discount Value should not be greater then Total Cost ")
          return false
        }
        else {
          setDiscountObj({
            ...discountObj,
            HundiOrDiscountValue: checkForNull(event.target.value)
          })
        }

      } else {
        Toaster.warning('Please enter valid number.')
      }
    }
  }


  /**
  * @method handleAnyOtherCostChange
  * @description HANDLE ANY OTHER COST CHANGE
  */
  const handleDiscountPercenatgeCostChange = (event) => {
    if (!CostingViewMode) {
      if (!isNaN(event.target.value)) {
        dispatch(isDiscountDataChange(true))
        setDiscountObj({
          ...discountObj,
          HundiOrDiscountPercentage: checkForNull(event.target.value)
        })
      }
    }
  }

  const onCRMHeadChangeOther = (e) => {
    if (e) {
      setDiscountObj({
        ...discountObj,
        OtherCRMHead: e?.label
      })
    }
  }

  const onCRMHeadChangeDiscount = (e) => {
    if (e) {
      setDiscountObj({
        ...discountObj,
        DiscountCRMHead: e?.label
      })
    }
  }


  /**
  * @method onPressChangeCurrency
  * @description TOGGLE CURRENCY CHANGE
  */
  const onPressChangeCurrency = () => {
    setValue('Currency', '')
    setCurrency([])
    setIsCurrencyChange(!IsCurrencyChange)
    setCurrencyExchangeRate(0)
    setValue('NetPOPriceOtherCurrency', 0)
    setNetPoPriceCurrencyState(0)
    setShowWarning(false)
    dispatch(isDiscountDataChange(true))
    dispatch(resetExchangeRateData());
  }

  /**
    * @method handleCurrencyChange
    * @description  RATE CRITERIA CHANGE HANDLE
    */
  const handleCurrencyChange = (newValue) => {
    if (newValue && newValue !== '') {
      dispatch(isDiscountDataChange(true))
      setCurrency(newValue)
      setIsInputLader(true)
      let costingTypeId = (costData.CostingTypeId === VBCTypeId || costData.CostingTypeId === NFRTypeId) ? VBCTypeId : costData.CostingTypeId
      dispatch(getExchangeRateByCurrency(newValue.label, costingTypeId, DayTime(CostingEffectiveDate).format('YYYY-MM-DD'), costData.VendorId, costData.CustomerId, false, res => {
        setIsInputLader(false)
        if (Object.keys(res.data.Data).length === 0) {
          setShowWarning(true)
        }
        else {
          setShowWarning(false)
        }
        if (res && res.data && res.data.Result) {
          let Data = res.data.Data;
          const NetPOPriceINR = getValues('NetPOPriceINR');
          setValue('NetPOPriceOtherCurrency', checkForDecimalAndNull((NetPOPriceINR / Data.CurrencyExchangeRate), initialConfiguration?.NoOfDecimalForPrice))
          setNetPoPriceCurrencyState(NetPOPriceINR / Data.CurrencyExchangeRate)
          setCurrencyExchangeRate(Data.CurrencyExchangeRate)
          setIsInputLader(false)
        }
      }))
    } else {
      setCurrency([])
      setCurrencyExchangeRate('')
    }
  }

  useEffect(() => {
    if (Object.keys(currency).length > 0) {
      dispatch(getExchangeRateByCurrency(currency.label, DayTime(CostingEffectiveDate).format('YYYY-MM-DD'), res => {
        if (res && res.data && res.data.Result) {
          let Data = res.data.Data;
          const NetPOPriceINR = getValues('NetPOPriceINR');
          setValue('NetPOPriceOtherCurrency', checkForDecimalAndNull((NetPOPriceINR / Data.CurrencyExchangeRate), initialConfiguration?.NoOfDecimalForPrice))
          setNetPoPriceCurrencyState(NetPOPriceINR / Data.CurrencyExchangeRate)
          setCurrencyExchangeRate(Data.CurrencyExchangeRate)
        }
      }))
    }
  }, [CostingEffectiveDate])

  /**
  * @method renderListing
  * @description Used show listing of unit of measurement
  */
  const renderListing = (label) => {

    const temp = [];
    let tempList = [];

    if (label === 'Currency') {
      currencySelectList && currencySelectList.map(item => {
        if (item.Value === '0' || item.Text === 'INR') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      tempList = [...temp]
      return tempList;
    }

    if (label === 'OtherCostType') {
      return [
        { label: 'Fixed', value: 'Fixed' },
        { label: 'Percentage', value: 'Percentage' },
      ];
    }
    if (label === 'HundiDiscountType') {
      return [
        { label: 'Fixed', value: 'Fixed' },
        { label: 'Percentage', value: 'Percentage' },
      ];
    }
    if (label === 'Applicability') {
      costingHead && costingHead.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      if (isBreakupBoughtOutPartCostingFromAPI) {
        tempList = removeBOPfromApplicability([...temp])
        //MINDA
        // tempList = removeBOPFromList([...temp])
      } else {
        tempList = [...temp]
      }
      return tempList;
    }
    if (label === 'evaluationType') {
      evaluationType && evaluationType.map((item) => {
        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value })
        return null
      })
      return temp
    }

  }

  /**
  * @method setDisableFalseFunction
  * @description setDisableFalseFunction
  */
  const setDisableFalseFunction = () => {
    const loop = checkForNull(dropzone.current.files.length) - checkForNull(files.length)
    if (checkForNull(loop) === 1 || checkForNull(dropzone.current.files.length) === checkForNull(files.length)) {
      setIsDisable(false)
    }
  }
  /**
  * @method setDisableFalseFunctionFeasibility
  * @description setDisableFalseFunctionFeasibility
  */
  const setDisableFalseFunctionFeasibility = () => {
    const loop = checkForNull(dropzoneCapacity?.current?.files?.length) - checkForNull(capacityFiles?.length)
    if (checkForNull(loop) === 1 || checkForNull(dropzoneCapacity?.current?.capacityFiles?.length) === checkForNull(capacityFiles?.length)) {
      setIsDisable(false)
    }
  }

  /**
  * @method setDisableFalseFunctionCapacity
  * @description setDisableFalseFunctionCapacity
  */
  const setDisableFalseFunctionCapacity = () => {
    const loop = checkForNull(dropzoneCapacity?.current?.files?.length) - checkForNull(capacityFiles?.length)
    if (checkForNull(loop) === 1 || checkForNull(dropzoneCapacity?.current?.capacityFiles?.length) === checkForNull(capacityFiles?.length)) {
      setIsDisable(false)
    }
  }

  /**
  * @method setDisableFalseFunctionTimeline
  * @description setDisableFalseFunctionTimeline
  */
  const setDisableFalseFunctionTimeline = () => {
    const loop = checkForNull(dropzoneTimeline?.current?.files?.length) - checkForNull(timelineFiles?.length)
    if (checkForNull(loop) === 1 || checkForNull(dropzoneTimeline?.current?.capacityFiles?.length) === checkForNull(timelineFiles?.length)) {
      setIsDisable(false)
    }
  }

  // called every time a file's `status` changes
  const handleChangeStatus = ({ meta, file }, status) => {

    if (status === 'removed') {
      const removedFileName = file.name;
      let tempArr = files && files.filter(item => item.OriginalFileName !== removedFileName)
      setFiles(tempArr)
      setIsOpen(!IsOpen)
    }

    setIsDisable(true)
    setAttachmentLoader(true)
    if (status === 'done') {
      let data = new FormData()
      data.append('file', file)
      dispatch(fileUploadCosting(data, (res) => {
        setDisableFalseFunction()
        if ('response' in res) {
          status = res && res?.response?.status
          dropzone.current.files.pop()
        }
        else {
          let Data = res.data[0]
          files.push(Data)
          setFiles(files)
          setAttachmentLoader(false)
          setTimeout(() => {
            setIsOpen(!IsOpen)
          }, 500);
        }
      }))
    }

    if (status === 'rejected_file_type') {
      Toaster.warning('Allowed only xls, doc, jpeg, pdf files.')
    } else if (status === 'error_file_size') {
      setDisableFalseFunction()
      setAttachmentLoader(false)
      dropzone.current.files.pop()
      Toaster.warning("File size greater than 20 mb not allowed")
    } else if (status === 'error_validation'
      || status === 'error_upload_params' || status === 'exception_upload'
      || status === 'aborted' || status === 'error_upload') {
      setDisableFalseFunction()
      setAttachmentLoader(false)
      dropzone.current.files.pop()
      Toaster.warning("Something went wrong")
    }
  }

  const deleteFile = (FileId, OriginalFileName) => {
    if (FileId != null) {
      let deleteData = {
        Id: FileId,
        DeletedBy: loggedInUserId(),
      }
      dispatch(fileDeleteCosting(deleteData, (res) => {
        Toaster.success('File deleted successfully.')
        let tempArr = files && files.filter(item => item.FileId !== FileId)
        setFiles(tempArr)
        setIsOpen(!IsOpen)
      }))
    }
    if (FileId == null) {
      let tempArr = files && files.filter(item => item.FileName !== OriginalFileName)
      setFiles(tempArr)
      setIsOpen(!IsOpen)
    }

    // ********** DELETE FILES THE DROPZONE'S PERSONAL DATA STORE **********
    if (dropzone?.current !== null) {
      dropzone.current.files.pop()
    }
  }

  const Preview = ({ meta }) => {
    return (
      <span style={{ alignSelf: 'flex-start', margin: '10px 3%', fontFamily: 'Helvetica' }}>
        {/* {Math.round(percent)}% */}
      </span>
    )
  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  const onSubmit = debounce((values, val, gotoNextValue) => {
    setPaymentTermsWarning(false)
    if (errorCheckObject(ErrorObjDiscount)) return false;
    console.log('conditionTableData: ', conditionTableData);
    if (conditionTableData.length === 0) {
      Toaster.warning("Tax code is mandatory.Please add from the drawer")
      return false
    }
    if (!getValues('discountDescriptionRemark') && discountCostApplicability?.value) {
      errors.discountDescriptionRemark = {
        "type": "required",
        "message": "",
        "ref": {
          "name": "discountDescriptionRemark",
          "value": ""
        }
      }
      setRerender(!reRender)
      return false
    }
    const tabData = RMCCTabData[0]
    const surfaceTabData = SurfaceTabData[0]
    const overHeadAndProfitTabData = OverheadProfitTabData[0]
    const discountAndOtherTabData = DiscountCostData
    const packageAndFreightTabData = PackageAndFreightTabData && PackageAndFreightTabData[0]
    const toolTabData = ToolTabData && ToolTabData[0]

    let updatedFiles = files.map((file) => {
      return { ...file, ContextId: costData.CostingId }
    })

    let otherCostFinalArray = []
    otherCostArray && otherCostArray.map(item => {
      let data1 = {
        "Type": 'Other',
        "ApplicabilityType": item?.OtherCostApplicability,
        "ApplicabilityCost": item?.ApplicabilityCost,
        "ApplicabilityIdRef": item?.OtherCostApplicabilityId,
        "Description": item?.OtherCostDescription,
        "NetCost": item?.AnyOtherCost,
        "Value": item?.PercentageOtherCost,
        "CRMHead": item?.CRMHead,

      }
      otherCostFinalArray.push(data1)
    })

    let discountArray = []
    discountCostArray && discountCostArray.map(item => {
      let tempData = {
        "Type": 'Discount',
        "ApplicabilityType": item?.applicability,
        "ApplicabilityIdRef": item.ApplicabilityIdRef,
        ApplicabilityCost: item.ApplicabilityCost,
        "Description": item.Description,
        "NetCost": item.NetCost,
        "Value": item.PercentageDiscountCost,
        "CRMHead": item.CRMHead,
      }
      discountArray.push(tempData)
    })


    let data = {
      "CostingId": costData?.CostingId,
      "PartId": costData?.PartId,
      "PartNumber": costData?.PartNumber,
      "NetPOPrice": checkForNull(netPOPrice),
      "TotalCost": checkForNull(netPOPrice),
      "LoggedInUserId": loggedInUserId(),
      "EffectiveDate": CostingEffectiveDate,
      "BasicRate": checkForNull(netPOPrice) - (checkForNull(totalNpvCost) + checkForNull(totalConditionCost)),
      "CurrencyId": currency?.value,
      "Currency": currency?.label,
      "IsChangeCurrency": IsCurrencyChange,
      "NetPOPriceInOtherCurrency": netPoPriceCurrencyState,
      "CurrencyExchangeRate": CurrencyExchangeRate,
      "Remark": getValues('Remarks'),

      "CostingPartDetails": {

        "CostingDetailId": costData?.CostingId,
        "PartId": costData?.PartId,
        "PartTypeId": "00000000-0000-0000-0000-000000000000",
        "Type": costData?.VendorType,
        "PartNumber": costData?.PartNumber,
        "PartName": costData?.PartName,
        "Quantity": 1,
        "IsOpen": true,
        "IsPrimary": true,
        "Sequence": '0',
        "NetDiscountsCost": DiscountCostData?.HundiOrDiscountValue,
        "TotalCost": checkForNull(netPOPrice),
        "NetOtherCost": DiscountCostData?.AnyOtherCost,
        "OtherCostDetails": otherCostFinalArray,
        "DiscountCostDetails": discountArray,
        "NetNpvCost": checkForNull(totalNpvCost),
        "NetConditionCost": checkForNull(totalConditionCost),
      },
      "SANumber": getValues('SANumber'),
      "LineNumber": getValues('LineNumber'),
      "ValuationType": SAPData?.evaluationType,
      "IsValuationValid": SAPData?.isValuationValid,
      "Attachements": updatedFiles
    }
    let obj = {
      "LoggedInUserId": loggedInUserId(),
      "BaseCostingId": costData?.CostingId || "",
      "NetPaymentTermCost": DiscountAndOtherCostTabData?.NetCost || 0,
      "IsPaymentTerms": true,
      // "ApplicabilityCost": DiscountAndOtherCostTabData?.ApplicabilityCost || "",
      "PaymentTermDetail": {
        "InterestRateId": DiscountAndOtherCostTabData?.InterestRateId || "",
        "PaymentTermDetailId": "",
        "PaymentTermApplicability": DiscountAndOtherCostTabData?.PaymentTermApplicability || "",
        "RepaymentPeriod": DiscountAndOtherCostTabData?.RepaymentPeriod || 0,
        "InterestRate": DiscountAndOtherCostTabData?.InterestRate || 0,
        "NetCost": DiscountAndOtherCostTabData?.NetCost || 0,
        "EffectiveDate": DiscountAndOtherCostTabData?.EffectiveDate || "",
        "PaymentTermCRMHead": DiscountAndOtherCostTabData?.PaymentTermCRMHead || "",
        "Remark": DiscountAndOtherCostTabData?.Remark || ""
      }
    };

    if (costData.IsAssemblyPart === true && !partType) {
      let assemblyRequestedData = createToprowObjAndSave(tabData, surfaceTabData, PackageAndFreightTabData, overHeadAndProfitTabData, ToolTabData, discountAndOtherTabData, netPOPrice, getAssemBOPCharge, 6, CostingEffectiveDate, '', '', isPartType, initialConfiguration?.IsAddPaymentTermInNetCost)
      if (!CostingViewMode) {
        dispatch(saveAssemblyPartRowCostingCalculation(assemblyRequestedData, res => { }))
        dispatch(isDiscountDataChange(false))
      }
    }

    if (!CostingViewMode) {
      dispatch(saveDiscountOtherCostTab(data, res => {
        if (res.data.Result) {
          Toaster.success(MESSAGES.OTHER_DISCOUNT_COSTING_SAVE_SUCCESS);
          // dispatch(setComponentDiscountOtherItemData({}, () => { }))
          dispatch(saveAssemblyBOPHandlingCharge({}, () => { }))
          dispatch(isDiscountDataChange(false))
          if (gotoNextValue && !isNFR) {
            props.toggle('2')
            history.push('/costing-summary')
          }
          if (isNFR && gotoNextValue) {
            reactLocalStorage.setObject('isFromDiscountObj', true)
            setNfrListing(true)
          }
        }
      }))

      if (checkIsPaymentTermsDataChange === true) {
        dispatch(saveCostingPaymentTermDetail(obj, res => { }))
      }
    }

    setTimeout(() => {
      if (partType) {

        let tempsubAssemblyTechnologyArray = subAssemblyTechnologyArray[0]
        tempsubAssemblyTechnologyArray.CostingPartDetails.NetOtherCost = DiscountCostData.AnyOtherCost
        tempsubAssemblyTechnologyArray.CostingPartDetails.NetDiscounts = DiscountCostData.HundiOrDiscountValue
        const totalOverheadPrice = OverheadProfitTabData && (checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.OverheadCost) + checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.ProfitCost) + checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.RejectionCost) /* + checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.PaymentTermCost) */ + checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.ICCCost))
        let totalCost = (checkForNull(tempsubAssemblyTechnologyArray?.CostingPartDetails?.TotalCalculatedRMBOPCCCost) +
          checkForNull(surfaceTabData?.CostingPartDetails?.NetSurfaceTreatmentCost) +
          checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
          checkForNull(ToolTabData && ToolTabData[0]?.CostingPartDetails?.TotalToolCost) +
          checkForNull(totalOverheadPrice) +
          checkForNull(DiscountCostData?.AnyOtherCost) + checkForNull(DiscountCostData?.totalConditionCost)) + (initialConfiguration?.IsAddPaymentTermInNetCost ? checkForNull(DiscountCostData?.paymentTermCost) : 0) -
          checkForNull(DiscountCostData?.HundiOrDiscountValue)

        let request = formatMultiTechnologyUpdate(tempsubAssemblyTechnologyArray, totalCost, surfaceTabData, overHeadAndProfitTabData, packageAndFreightTabData, toolTabData, DiscountCostData, CostingEffectiveDate, initialConfiguration?.IsAddPaymentTermInNetCost)
        dispatch(updateMultiTechnologyTopAndWorkingRowCalculation(request, res => { }))
        dispatch(gridDataAdded(true))
        dispatch(isDiscountDataChange(false))
        dispatch(setComponentDiscountOtherItemData({}, () => { }))
        dispatch(setPaymentTermsDataInDiscountOtherTab({}, () => { }))

      }
    }, 500);

  }, 500)


  const handleDiscountApplicabilityChange = (value) => {
    if (!value) {
      errors.discountDescriptionRemark = {}
    }
    if (!CostingViewMode) {
      if (value && value !== '') {
        dispatch(isDiscountDataChange(true))
        setHundiDiscountType(value.label !== 'Fixed' ? { label: 'Percentage', value: 'Percentage' } : value)
        setValue('HundiOrDiscountValue', 0)
        setValue('HundiOrDiscountPercentage', 0)
        setValue('HundiDiscountType', value.value)
        errors.HundiOrDiscountValue = {}
        errors.HundiOrDiscountPercentage = {}
        setDiscountCostApplicability(value)
        setDiscountObj({
          ...discountObj,
          DiscountCostType: value.label,
          DiscountApplicability: value.label,
          HundiOrDiscountPercentage: 0,
        })
      } else {
        setHundiDiscountType([])
        setValue('DiscountCostApplicability', '')
        setValue('HundiOrDiscountPercentage', '')
        setValue('HundiOrDiscountValue', '')
        setDiscountCostApplicability([])
        dispatch(isDiscountDataChange(true))
        setDiscountObj({
          ...discountObj,
          HundiOrDiscountPercentage: 0,
          HundiOrDiscountValue: 0,
          DiscountApplicability: '',
          DiscountCostType: ''
        })
      }
      errors.HundiOrDiscountPercentage = {}
    }

  }
  const isLoaderObj = { isLoader: isInputLoader, loaderClass: "align-items-center" }

  if (Object.keys(errors).length > 0 && counter < 2) {
    counter = counter + 1;
    dispatch(setDiscountErrors(errors))
  } else if (Object.keys(errors).length === 0 && counter > 0) {
    counter = 0
    dispatch(setDiscountErrors({}))
  }


  const setUpdatednetPoPrice = (data) => {
    dispatch(setNPVData([]))
    const sum = data.reduce((acc, obj) => checkForNull(acc) + checkForNull(obj.NpvCost), 0);
    setTotalNpvCost(sum)
    dispatch(isDiscountDataChange(true))
    setDiscountObj({
      ...discountObj,
      totalNpvCost: sum
    })

    // if (data) {
    //   let obj = {}
    //   obj.CostingId = RMCCTabData && RMCCTabData[0]?.CostingId
    //   obj.LoggedInUserId = loggedInUserId()
    //   obj.NpvDetails = data
    //   dispatch(saveCostingDetailNpv(obj, () => { }))
    // }
  }

  const openAndCloseAddNpvDrawer = (type, data = npvTableData) => {
    if (type === 'Open') {
      setisOpenandClose(true)
    } else {
      setisOpenandClose(false)
      setUpdatednetPoPrice(data)
      setNpvTableData(data)
      dispatch(setNPVData([]))
      const sum = data.reduce((acc, obj) => checkForNull(acc) + checkForNull(obj.NpvCost), 0);
      setTotalNpvCost(sum)
      dispatch(isDiscountDataChange(true))
      setDiscountObj({
        ...discountObj,
        totalNpvCost: sum
      })

      if (type === 'save') {
        let obj = {}
        obj.CostingId = RMCCTabData && RMCCTabData[0]?.CostingId
        obj.LoggedInUserId = loggedInUserId()
        obj.NpvDetails = data
        dispatch(saveCostingDetailNpv(obj, () => { }))
      }
      setUpdatednetPoPrice(data)
    }
  }
  const openAndCloseAddConditionCosting = (type, data = conditionTableData, costingConditionEntryType) => {
    if (type === 'Open') {
      setIsConditionCostingOpen(true)
    } else {
      setIsConditionCostingOpen(false)
      seConditionTableData(data)
      const sum = data.reduce((acc, obj) => checkForNull(acc) + checkForNull(obj.ConditionCost), 0);
      setTotalConditionCost(sum)
      dispatch(isDiscountDataChange(true))
      setDiscountObj({
        ...discountObj,
        totalConditionCost: checkForNull(sum)
      })

      if (type === 'save') {
        if (data) {
          // let list = data && data?.map(item => {
          //   // item.Percentage = item?.ConditionPercentage
          //   // delete item?.ConditionPercentage
          //   return item
          // })
          let obj = {}
          obj.CostingId = RMCCTabData && RMCCTabData[0]?.CostingId
          obj.LoggedInUserId = loggedInUserId()
          obj.ConditionsData = data
          obj.CostingConditionEntryTypeId = costingConditionEntryType
          dispatch(saveCostingDetailCondition(obj, () => { }))
        }
      }

    }
  }


  if (nfrListing === true) {

    return <Redirect
      to={{
        pathname: "/nfr",
        state: {
        }

      }}
    />
  }
  function handleInputChanges(quantity, percentage, sumForNPV) {
    let totalFinal = 0

    if (percentage) {
      totalFinal = (checkForNull(percentage) / 100) * checkForNull(sumForNPV) * checkForNull(quantity)
    }
    return totalFinal
  }

  const refreshAllData = () => {
    let finalListCondition = []
    let tempListCondition = [...conditionTableData]

    tempListCondition && tempListCondition?.map((item) => {
      let finalValue = 0
      if (item?.ConditionType === "Fixed" || item?.ConditionType === "Quantity") {
        finalValue = item?.ConditionCost
      } else if (item?.ConditionType === "Percentage") {
        finalValue = (checkForNull(item?.Percentage) / 100) * checkForNull(getValues('BasicRateINR'))
      }
      let tempObject = { ...item, ConditionCost: finalValue }
      finalListCondition.push(tempObject)
    })
    seConditionTableData(finalListCondition)
    const sum = finalListCondition.reduce((acc, obj) => checkForNull(acc) + checkForNull(obj.ConditionCost), 0);

    if (finalListCondition) {
      let obj = {}
      obj.CostingId = RMCCTabData && RMCCTabData[0]?.CostingId
      obj.LoggedInUserId = loggedInUserId()
      obj.ConditionsData = finalListCondition
      obj.CostingConditionEntryTypeId = costingConditionEntryType
      dispatch(saveCostingDetailCondition(obj, () => { }))
    }

    let sumForNPV = getValues('BasicRateINR') + sum

    let finalList = []
    let tempList = [...npvTableData]
    let sumNPV = 0
    tempList && tempList?.map((item) => {
      let totalFinal = 0
      let tempObject = { ...item }
      switch (tempObject?.NpvType) {
        case "Tool Investment":
          totalFinal = handleInputChanges(ToolTabData[0]?.CostingPartDetails?.CostingToolCostResponse[0]?.Life, tempObject?.NpvPercentage, sumForNPV)
          sumNPV = sumNPV + totalFinal
          tempObject.NpvCost = totalFinal
          break;
        case "Additional Investment":
          totalFinal = handleInputChanges(tempObject?.NpvQuantity, tempObject?.NpvPercentage, sumForNPV)
          sumNPV = sumNPV + totalFinal
          tempObject.NpvCost = totalFinal
          break;
        case "One Time Investment":
          totalFinal = handleInputChanges(tempObject?.NpvQuantity, tempObject?.NpvPercentage, sumForNPV)
          sumNPV = sumNPV + totalFinal
          tempObject.NpvCost = totalFinal
          break;
        default:
          break;
      }
      finalList.push(tempObject)
    })

    let netPO = sumForNPV + sumNPV

    setTotalConditionCost(sum)
    setTotalNpvCost(sumNPV)
    dispatch(isDiscountDataChange(true))
    setDiscountObj({
      ...discountObj,
      totalConditionCost: checkForNull(sum),
      totalNpvCost: checkForNull(sumNPV)
    })

    dispatch(setPOPrice(netPO, () => { }))
    setNpvTableData(finalList)

    if (finalList) {
      let obj = {}
      obj.CostingId = RMCCTabData && RMCCTabData[0]?.CostingId
      obj.LoggedInUserId = loggedInUserId()
      obj.NpvDetails = finalList
      dispatch(saveCostingDetailNpv(obj, () => { }))
    }
  }
  const handleOtherCostdrawer = () => {
    setOpenCloseOtherCost(true)
  }

  const closeOtherCostDrawer = (type, otherCost, otherCostArr) => {
    if (type === 'submit') {
      setDiscountObj({
        ...discountObj,
        AnyOtherCost: otherCost
      })
      setValue('AnyOtherCost', checkForDecimalAndNull(otherCost, initialConfiguration.NoOfDecimalForPrice))
      dispatch(isDiscountDataChange(true))
      setOtherCostArray(otherCostArr)
      setOpenCloseOtherCost(false)
    } else {
      setOpenCloseOtherCost(false)
    }
    let request = partType ? 'multiple technology assembly' : ''
    dispatch(fetchCostingHeadsAPI(request, false, (res) => { }))
  }
  const closeOtherDiscountDrawer = (type, discountTotal, discountTableData) => {
    if (type === 'cancel') {
      setOpenCloseOtherDiscount(false)
    } else if (type === 'submit') {
      setDiscountObj({
        ...discountObj,
        HundiOrDiscountValue: discountTotal
      })
      setValue('HundiOrDiscountValue', checkForDecimalAndNull(discountTotal, initialConfiguration.NoOfDecimalForPrice))
      dispatch(isDiscountDataChange(true))
      setOpenCloseOtherDiscount(false)
      setDiscountCostArray(discountTableData)
    }
  }
  const setDisableFalseFunctionAttachmentFiles = (value) => {
    switch (value) {
      case ATTACHMENT:
        setAttachmentLoaderObj(prevState => ({ ...prevState, loaderAttachment: false }))
        break;
      case FEASIBILITY:
        setAttachmentLoaderObj(prevState => ({ ...prevState, loaderFeasibility: false }))
        break;
      case CAPACITY:
        setAttachmentLoaderObj(prevState => ({ ...prevState, loaderCapacity: false }))
        break;
      case TIMELINE:
        setAttachmentLoaderObj(prevState => ({ ...prevState, loaderTimeline: false }))
        break;
      default:
        break;
    }
  }

  const handleChangeFeasibility = ({ meta, file }, status) => {

    setAttachmentLoaderObj(prevState => ({ ...prevState, loaderFeasibility: true }))
    setIsDisable(true)
    if (status === 'removed') {
      const removedFileName = file.name;
      let tempArr = feasibilityFiles && feasibilityFiles.filter(item => item.OriginalFileName !== removedFileName)
      setFeasibilityFiles(tempArr)
      setIsOpenFeasibility(!IsOpen)
    }

    if (status === 'done') {
      let data = new FormData();
      data.append('file', file);
      setApiCallCounter(prevCounter => prevCounter + 1);  // Increment the API call counter for loader showing
      dispatch(fileUploadCosting(data, (res) => {
        setDisableFalseFunctionFeasibility();
        if ('response' in res) {
          status = res && res?.response?.status;
          dropzoneFeasibility?.current?.files?.pop();
        } else {
          let Data = res.data[0];
          Data.AttachementCategory = 'Feasibility'
          setFeasibilityFiles(prevFiles => [...prevFiles, Data]); // Update the state using the callback function
        }
        setApiCallCounterFeasibility(prevCounter => prevCounter - 1);

        // Check if this is the last API call
        setDisableFalseFunctionAttachmentFiles(FEASIBILITY)
        setIsDisable(false)
        if (apiCallCounterFeasibility === 0) {
          setTimeout(() => {
            setIsOpenFeasibility(!IsOpenFeasibility);
          }, 500);
        }
      }));
    }

    if (status === 'rejected_file_type') {
      setDisableFalseFunctionAttachmentFiles(FEASIBILITY)
      Toaster.warning('Allowed only xls, doc, jpeg, pdf files.')
    } else if (status === 'error_file_size') {
      setDisableFalseFunctionAttachmentFiles(FEASIBILITY)
      dropzoneCapacity.current?.files.pop()
      Toaster.warning("File size greater than 5mb not allowed")
    } else if (status === 'error_validation'
      || status === 'error_upload_params' || status === 'exception_upload'
      || status === 'aborted' || status === 'error_upload') {
      setDisableFalseFunctionAttachmentFiles(FEASIBILITY)
      dropzoneCapacity.current?.files.pop()
      Toaster.warning("Something went wrong")
    }
  }

  const handleChangeCapacity = ({ meta, file }, status) => {

    setAttachmentLoaderObj(prevState => ({ ...prevState, loaderCapacity: true }))
    setIsDisable(true)
    if (status === 'removed') {
      const removedFileName = file.name;
      let tempArr = capacityFiles && capacityFiles.filter(item => item.OriginalFileName !== removedFileName)
      setCapacityFiles(tempArr)
      setIsOpenCapacity(!IsOpen)
    }

    if (status === 'done') {
      let data = new FormData();
      data.append('file', file);
      setApiCallCounter(prevCounter => prevCounter + 1);  // Increment the API call counter for loader showing
      dispatch(fileUploadCosting(data, (res) => {
        setDisableFalseFunctionCapacity();
        if ('response' in res) {
          status = res && res?.response?.status;
          dropzoneCapacity?.current?.files?.pop();
        } else {
          let Data = res.data[0];
          Data.AttachementCategory = 'Capacity'
          setCapacityFiles(prevFiles => [...prevFiles, Data]); // Update the state using the callback function
        }
        setApiCallCounterCapacity(prevCounter => prevCounter - 1);

        setDisableFalseFunctionAttachmentFiles(CAPACITY)
        setIsDisable(false)
        // Check if this is the last API call
        if (apiCallCounterCapacity === 0) {
          setTimeout(() => {
            setIsOpenCapacity(!IsOpenCapacity);
          }, 500);
        }
      }));
    }

    if (status === 'rejected_file_type') {
      setDisableFalseFunctionAttachmentFiles(CAPACITY)
      Toaster.warning('Allowed only xls, doc, jpeg, pdf files.')
    } else if (status === 'error_file_size') {
      setDisableFalseFunctionAttachmentFiles(CAPACITY)
      dropzoneCapacity.current?.files.pop()
      Toaster.warning("File size greater than 5mb not allowed")
    } else if (status === 'error_validation'
      || status === 'error_upload_params' || status === 'exception_upload'
      || status === 'aborted' || status === 'error_upload') {
      setDisableFalseFunctionAttachmentFiles(CAPACITY)
      dropzoneCapacity.current?.files.pop()
      Toaster.warning("Something went wrong")
    }
  }

  const handleChangeTimeline = ({ meta, file }, status) => {

    setIsDisable(true)
    setAttachmentLoaderObj(prevState => ({ ...prevState, loaderTimeline: true }))
    if (status === 'removed') {
      const removedFileName = file.name;
      let tempArr = timelineFiles && timelineFiles.filter(item => item.OriginalFileName !== removedFileName)
      setTimelineFiles(tempArr)
      setIsOpen(!IsOpen)
    }

    if (status === 'done') {
      let data = new FormData();
      data.append('AttachementCategory', 'Timeline');
      data.append('file', file);
      setApiCallCounterTimeline(prevCounter => prevCounter + 1);  // Increment the API call counter for loader showing
      dispatch(fileUploadCosting(data, (res) => {
        setDisableFalseFunctionTimeline();
        if ('response' in res) {
          status = res && res?.response?.status;
          dropzoneTimeline?.current?.files?.pop();
        } else {
          let Data = res.data[0];
          Data.AttachementCategory = 'Timeline'
          setTimelineFiles(prevFiles => [...prevFiles, Data]); // Update the state using the callback function
        }
        setApiCallCounterTimeline(prevCounter => prevCounter - 1);

        setDisableFalseFunctionAttachmentFiles(TIMELINE)
        setIsDisable(false)
        // Check if this is the last API call
        if (apiCallCounterTimeline === 0) {
          setTimeout(() => {
            setIsOpenTimeline(!IsOpenTimeline);
          }, 500);
        }
      }));

    }

    if (status === 'rejected_file_type') {
      setDisableFalseFunctionAttachmentFiles(TIMELINE)
      Toaster.warning('Allowed only xls, doc, jpeg, pdf files.')
    } else if (status === 'error_file_size') {
      setDisableFalseFunctionAttachmentFiles(TIMELINE)
      dropzoneTimeline.current?.files.pop()
      Toaster.warning("File size greater than 5mb not allowed")
    } else if (status === 'error_validation'
      || status === 'error_upload_params' || status === 'exception_upload'
      || status === 'aborted' || status === 'error_upload') {
      setDisableFalseFunctionAttachmentFiles(TIMELINE)
      dropzoneTimeline.current?.files.pop()
      Toaster.warning("Something went wrong")
    }
  }
  const deleteFileFeasibility = (FileId, OriginalFileName) => {
    if (FileId != null) {
      let tempArr = feasibilityFiles && feasibilityFiles.filter(item => item.FileId !== FileId)
      setFeasibilityFiles(tempArr)
    }
    if (FileId == null) {
      let tempArr = feasibilityFiles && feasibilityFiles.filter(item => item.FileName !== OriginalFileName)
      setFeasibilityFiles(tempArr)
      setIsOpen(!IsOpen)
    }
    if (dropzoneFeasibility?.current !== null) {
      setCountFeasibility(countFeasibility - 1)
      dropzoneFeasibility.current?.files.pop()
    }
  }

  const deleteFileCapacity = (FileId, OriginalFileName) => {
    if (FileId != null) {
      let tempArr = capacityFiles && capacityFiles.filter(item => item.FileId !== FileId)
      setCapacityFiles(tempArr)
    }
    if (FileId == null) {
      let tempArr = capacityFiles && capacityFiles.filter(item => item.FileName !== OriginalFileName)
      setCapacityFiles(tempArr)
      setIsOpen(!IsOpen)
    }
    if (dropzoneCapacity?.current !== null) {
      setCountCapacity(countCapacity - 1)
      dropzoneCapacity.current?.files.pop()
    }
  }

  const deleteFileTimeline = (FileId, OriginalFileName) => {
    if (FileId != null) {
      let tempArr = timelineFiles && timelineFiles.filter(item => item.FileId !== FileId)
      setTimelineFiles(tempArr)
    }
    if (FileId == null) {
      let tempArr = timelineFiles && timelineFiles.filter(item => item.FileName !== OriginalFileName)
      setTimelineFiles(tempArr)
      setIsOpen(!IsOpen)
    }
    if (dropzoneTimeline?.current !== null) {
      setCountTimeline(countTimeline - 1)
      dropzoneTimeline.current?.files.pop()
    }
  }

  if (nfrListing === true) {

    return <Redirect
      to={{
        pathname: "/nfr",
        state: {
        }

      }}
    />
  }
  /**
 * @method handlePaymentTerm
 * @description  handlePaymentTerm
 */
  const handlePaymentTerm = () => {
    setPaymentTerms(!paymentTerms)
    //dispatch(getCostingPaymentTermDetail(costData?.CostingId, () => { }))
  }
  /**
 * @method setPaymentTermsDetail
 * @description  set updated NetPaymentTermCost 
 */
  const setPaymentTermsDetail = (data, params) => {
    let updatedPaymentTermobj = {
      ...PaymentTermDataDiscountTab,
      PaymentTermDetail: {
        ...PaymentTermDataDiscountTab.PaymentTermDetail,
        ...data
      }
    };
    updatedPaymentTermobj.NetPaymentTermCost = data.NetCost;

    dispatch(setPaymentTermsDataInDiscountOtherTab(updatedPaymentTermobj, () => { }))
    dispatch(setDiscountAndOtherCostData(data, () => { }));
  };

  const handleValuationType = (value) => {


    dispatch(setSAPData({ ...SAPData, evaluationType: value?.label ?? '', isValuationValid: evaluationType.length > 0 ? true : false }))
  }

  return (
    <>
      {!nfrListing && <div className="login-container signup-form">
        <div className="p-3 costing-border w-100 border-top-0">
          <Row>
            <Col md="12">
              <div className="shadow-lgg login-formg">
                <Row>
                  <Col md={12}>
                    <div className='tab-disount-total-cost mt-4'>
                      <span >Total Cost:</span>
                      <TooltipCustom width={"300px"} disabledIcon={true} id={'total-cost-tab-discount'} tooltipText={`Total Cost = Net RM ${showBopLabel()} CC + SurfaceTreatment Cost + Overheads&Profit Cost + Packaging&Freight Cost + Tool Cost`} />
                      <p id={'total-cost-tab-discount'} className='disabled-input-data'>{`${totalCost && totalCost !== undefined ? checkForDecimalAndNull(totalCost, initialConfiguration.NoOfDecimalForPrice) : 0}`}</p>
                      <button type="button" id="total_refresh" className={'refresh-icon ml-2'} onClick={() => refreshAllData()}></button>
                      <TooltipCustom disabledIcon={true} id="total_refresh" tooltipText="Refresh to update Discount, Other cost and Cost" />
                    </div >
                  </Col >
                </Row >
                <form
                  noValidate
                  className="form"
                >
                  <Row>
                    {/* {
                      initialConfiguration.IsShowCRMHead && <Col md="3">
                        <SearchableSelectHookForm
                          name={`crmHeadDiscount`}
                          type="text"
                          label="CRM Head"
                          errors={errors.crmHeadDiscount}
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
                          handleChange={onCRMHeadChangeDiscount}
                          disabled={CostingViewMode}
                        />
                      </Col>} */}
                    {/* <Col md="3">
                      <TextFieldHookForm
                        label="Discount Description/Remark"
                        name={"discountDescriptionRemark"}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={discountCostApplicability?.value ? true : false}
                        rules={{
                          required: discountCostApplicability?.value ? true : false,
                          validate: { hashValidation, checkWhiteSpaces, maxLength80, }
                        }}
                        handleChange={() => { }}
                        placeholder={'Enter'}
                        customClassName={'withBorder'}
                        disabled={CostingViewMode}
                        errors={errors.discountDescriptionRemark}
                      />
                    </Col >
                    <Col md="3">
                      <SearchableSelectHookForm
                        label={'Discount Applicability'}
                        name={'DiscountCostApplicability'}
                        placeholder={'Select'}
                        Controller={Controller}
                        control={control}
                        rules={{ required: false }}
                        register={register}
                        defaultValue={discountCostApplicability.length !== 0 ? discountCostApplicability : ''}
                        options={renderListing('Applicability')}
                        mandatory={false}
                        disabled={CostingViewMode ? true : false}
                        handleChange={handleDiscountApplicabilityChange}
                        errors={errors.DiscountCostApplicability}
                        isClearable={true}
                      />
                    </Col>
                    {
                      <Col md="3">
                        <TextFieldHookForm
                          label="Discount (%)"
                          name={"HundiOrDiscountPercentage"}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={false}
                          rules={{
                            required: false,
                            validate: { number, checkWhiteSpaces, percentageLimitValidation },
                            max: {
                              value: 100,
                              message: 'Percentage cannot be greater than 100.'
                            },
                          }}
                          handleChange={(e) => {
                            e.preventDefault();
                            handleDiscountPercenatgeCostChange(e);
                          }}
                          defaultValue={""}
                          className=""
                          customClassName={"withBorder"}
                          errors={errors.HundiOrDiscountPercentage}
                          disabled={CostingViewMode || !(hundiscountType && hundiscountType.value === 'Percentage') ? true : false}
                        />
                      </Col>
                    } */}
                    <Col md="3">
                      <TooltipCustom disabledIcon={true} width="280px" id="otherCost" tooltipText={"Other Cost = Sum of other cost added in other cost drawer"} />
                      {otherCostUI}
                    </Col >
                    <Col md="3" >
                      {otherDiscountUI}
                    </Col >
                    <Col md="3">
                      {/*                <TooltipCustom disabledIcon={true} width="280px" id="npvCost" tooltipText={"NPV Cost = Sum of NPV cost added in NPV drawer"} /> */}
                      {npvDrawerCondition && shouldRenderNpvDrawer && npvCostUI}
                    </Col>
                    {/* {npvDrawerCondition && shouldRenderNpvDrawer && <Row>
                      <Col md="8"><div className="left-border mt-1">NPV Cost:</div></Col>
                      <Col md="4" className="text-right">
                        <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setNpvAcc(!npvAcc) }}>
                          {npvAcc ? (
                            <i className="fa fa-minus" ></i>
                          ) : (
                            <i className="fa fa-plus"></i>
                          )}
                        </button>
                      </Col>
                    </Row>}
                    {initialConfiguration?.IsShowNpvCost && npvAcc && <>
                      {!CostingViewMode && <Row className=''>
                        <Col md="12">
                          <div className='d-flex justify-content-end mb-2'>
                            <button
                              type="button"
                              className={"user-btn"}
                              onClick={() => openAndCloseAddNpvDrawer('Open')}
                              title="Add"
                            >
                              <div className={"plus mr-1"}></div> Add
                            </button>
                          </div>
                        </Col>
                      </Row>}

                      {initialConfiguration?.IsShowNpvCost && !isOpenandClose && <NpvCost netPOPrice={netPOPrice} tableData={npvTableData} hideAction={true} />}
                    </>} */}
                    {(IsRfqCostingType?.costingType || IsRfqCostingType?.isRfqCosting) && initialConfiguration?.IsShowTCO && <Col md="12">
                      <Row>
                        <Col md="8"><div className="left-border mt-1">TCO : </div></Col>
                        <Col md="4" className="text-right">
                          <Button
                            id="tabDiscount_tcoCost"
                            onClick={() => openAndCloseAddNpvDrawer('Open')}
                            className={"right mt-2"}
                            variant={"view-icon-primary"}
                            title={"view"}
                          />
                        </Col>
                      </Row>
                    </Col>}
                    <Col md="12">
                      <Row>
                        <Col md="8"><div className="left-border mt-1">Payment Terms:</div></Col>
                        <Col md="4" className="text-right">
                          <button className="btn btn-small-primary-circle YOY-acc ml-1" type="button" onClick={() => { handlePaymentTerm() }}>
                            {paymentTerms ? (
                              <i className="fa fa-minus" ></i>
                            ) : (
                              <i className="fa fa-plus"></i>
                            )}
                          </button>
                        </Col>
                      </Row>
                    </Col>
                    <Row>
                      {/* net cost *(90- usersvalues 60)/30 *1% */}
                      {paymentTerms && <Col md="12" className='payment-terms'>
                        <PaymentTerms
                          Controller={Controller}
                          control={control}
                          //  rules={rules}
                          register={register}
                          // defaultValue={}
                          setValue={setValue}
                          getValues={getValues}
                          errors={errors}
                          useWatch={useWatch}
                          CostingInterestRateDetail={getCostingPaymentDetails?.PaymentTermDetaill}
                          setPaymentTermsDetail={setPaymentTermsDetail}
                          PaymentTermDetail={getCostingPaymentDetails?.PaymentTermDetaill}
                          data={DiscountCostData}
                          showPaymentInDiscountTab={paymentTerms}
                          netPOPrice={netPOPrice}
                          showPaymentTerms={paymentTerms}
                          setPaymentTermsWarning={setPaymentTermsWarning}
                          paymentTermsWarning={paymentTermsWarning}
                        />
                      </Col>}
                    </Row>
                    {initialConfiguration?.IsBasicRateAndCostingConditionVisible &&
                      <Col md="3">
                        <TooltipCustom disabledIcon={true} width="280px" id="basic-rate" tooltipText={"Basic Price = (Total Cost - Hundi/Discount Value) + Total Other Cost"} />
                        <TextFieldHookForm
                          label={`Basic Price (${reactLocalStorage.getObject("baseCurrency")})`}
                          name={'BasicRateINR'}
                          Controller={Controller}
                          id="basic-rate"
                          control={control}
                          register={register}
                          mandatory={false}
                          rules={{}}
                          handleChange={() => { }}
                          defaultValue={""}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.BasicRateINR}
                          disabled={true}
                        />
                      </Col >}
                    {(initialConfiguration?.IsBasicRateAndCostingConditionVisible || isShowTaxCode) ? costingConditionUI : ''}
                    {
                      isConditionCostingOpen && <AddConditionCosting
                        isOpen={isConditionCostingOpen}
                        tableData={conditionTableData}
                        closeDrawer={openAndCloseAddConditionCosting}
                        anchor={'right'}
                        netPOPrice={netPOPrice}
                        basicRateCurrency={getValues('BasicRateINR')}
                        ViewMode={CostingViewMode}
                      />
                    }


                    {(initialConfiguration?.IsShowNpvCost /* || initialConfiguration?.IsShowTCO || IsRfqCostingType?.costingType || IsRfqCostingType?.isRfqCosting */) && isOpenandClose && <AddNpvCost
                      isOpen={isOpenandClose}
                      tableData={npvTableData}
                      closeDrawer={openAndCloseAddNpvDrawer}
                      anchor={'right'}
                      netPOPrice={netPOPrice - totalNpvCost}
                      costingId={costData?.CostingId}
                      totalCostFromSummary={false}
                      CostingViewMode={CostingViewMode}
                    />
                    }
                    <TooltipCustom disabledIcon={true} width="280px" id="net-po-price" tooltipText={"Net Cost = Basic Rate + Total Costing Condition Cost"} />
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Net Cost (${reactLocalStorage.getObject("baseCurrency")})`}
                        name={'NetPOPriceINR'}
                        Controller={Controller}
                        id="net-po-price"
                        control={control}
                        register={register}
                        mandatory={false}
                        rules={{}}
                        handleChange={() => { }}
                        defaultValue={""}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.NetPOPriceINR}
                        disabled={true}
                      />
                    </Col>
                    {showSaLineNumber() &&
                      <> <Col md="2">
                        <TextFieldHookForm
                          label="SA Number"
                          name={'SANumber'}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={false}
                          rules={{
                            validate: { maxLength20 }
                          }}
                          handleChange={() => { }}
                          defaultValue={""}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.SANumber}
                          disabled={CostingViewMode ? true : false}
                        />
                      </Col>
                        <Col md="2">
                          <TextFieldHookForm
                            label="Line Number"
                            name={'LineNumber'}
                            Controller={Controller}
                            control={control}
                            register={register}
                            mandatory={false}
                            rules={{ validate: { maxLength20 } }}
                            handleChange={() => { }}
                            defaultValue={""}
                            className=""
                            customClassName={'withBorder'}
                            errors={errors.LineNumber}
                            disabled={CostingViewMode ? true : false}
                          />
                        </Col></>}
                    {
                      getConfigurationKey().IsSAPConfigured &&
                      <Col md={"2"}>
                        <SearchableSelectHookForm
                          label={"Valuation Type"}
                          name={"evaluationType"}
                          placeholder={"Select"}
                          Controller={Controller}
                          control={control}
                          rules={{ required: false }}
                          register={register}
                          defaultValue={""}
                          options={renderListing("evaluationType")}
                          mandatory={false}
                          handleChange={handleValuationType}
                          errors={errors.evaluationType}
                          isClearable={true}
                          disabled={CostingViewMode ? true : false} />
                      </Col>
                    }
                  </Row >
                  <Row className="mt-2">
                    <Col md="3" className={`mt20 pt-3`}>
                      <label
                        className={`custom-checkbox`}
                        onChange={onPressChangeCurrency}
                        id="change_currency_input"
                      >
                        Change Currency
                        <input
                          type="checkbox"
                          checked={IsCurrencyChange}
                          disabled={CostingViewMode ? true : false}
                        />
                        <span
                          className=" before-box"
                          checked={IsCurrencyChange}
                          onChange={onPressChangeCurrency}
                        />
                      </label>
                    </Col>
                    {IsCurrencyChange && (
                      <>
                        <Col md="3">
                          <SearchableSelectHookForm
                            label={"Select Currency"}
                            name={"Currency"}
                            placeholder={"Select"}
                            Controller={Controller}
                            control={control}
                            rules={{ required: true }}
                            register={register}
                            defaultValue={currency.length !== 0 ? currency : ""}
                            options={renderListing("Currency")}
                            mandatory={true}
                            customClassName="mb-0"
                            handleChange={handleCurrencyChange}
                            errors={errors.Currency}
                            disabled={CostingViewMode || CostingEffectiveDate === '' ? true : false}
                          />
                          {showWarning && <WarningMessage dClass="mt-n3" message={`${currency.label} rate is not present in the Exchange Master`} />}
                        </Col>
                        <Col md="3">
                          <TextFieldHookForm
                            label={`Net Cost${Object.keys(currency).length > 0 ? '(' + currency.label + ')' : ''}`}
                            name={'NetPOPriceOtherCurrency'}
                            Controller={Controller}
                            control={control}
                            register={register}
                            mandatory={false}
                            rules={{}}
                            handleChange={() => { }}
                            defaultValue={""}
                            className=""
                            customClassName={'withBorder mb-0'}
                            errors={errors.NetPOPriceOtherCurrency}
                            disabled={true}
                            isLoading={isLoaderObj}
                          />
                        </Col>
                      </>
                    )}
                  </Row>
                  <Row>
                    <Col md="10">
                      <div className="left-border mt-3">
                        Remarks{isRfqAttachment ? "" : ' & Attachments'}:
                      </div>
                    </Col>

                    <Col md="6">
                      <TextAreaHookForm
                        label={`Remarks${isRfqAttachment ? "" : ' & Attachments'}:`}
                        name={"Remarks"}
                        Controller={Controller}
                        control={control}
                        register={register}
                        rowHeight={6}
                        mandatory={false}
                        rules={{
                          validate: { checkWhiteSpaces },
                          maxLength: {
                            value: 500,
                            message: "Remark should be less than 500 words."
                          },
                        }}
                        handleChange={() => { dispatch(isDiscountDataChange(true)) }}
                        defaultValue={""}
                        className=""
                        customClassName={"textAreaWithBorder"}
                        errors={errors.Remarks}
                        disabled={CostingViewMode ? true : false}
                      />
                    </Col>

                    {!isRfqAttachment ? <>
                      <Col md="3" className="height152-label">
                        <label>Upload Attachment (upload up to 4 files)</label>
                        <div className={`alert alert-danger mt-2 ${files.length === 4 ? '' : 'd-none'}`} role="alert">
                          Maximum file upload limit reached.
                        </div>
                        <div className={`${files.length >= 4 ? 'd-none' : ''}`} id="tabDiscount_attachments">
                          <Dropzone
                            ref={dropzone}
                            onChangeStatus={handleChangeStatus}
                            PreviewComponent={Preview}
                            //onSubmit={this.handleSubmit}
                            accept="image/jpeg,image/jpg,image/png,image/PNG,.xls,.doc,.pdf,.xlsx"
                            initialFiles={[]}
                            maxFiles={4}
                            maxSizeBytes={20000000}
                            inputContent={(files, extra) =>
                              extra.reject ? (
                                "Image, audio and video files only"
                              ) : (
                                <div className="text-center">
                                  <i className="text-primary fa fa-cloud-upload"></i>
                                  <span className="d-block">
                                    Drag and Drop or{" "}
                                    <span className="text-primary">Browse</span>
                                    <br />
                                    file to upload
                                  </span>
                                </div>
                              )
                            }
                            styles={{
                              dropzoneReject: {
                                borderColor: "red",
                                backgroundColor: "#DAA",
                              },
                              inputLabel: (files, extra) =>
                                extra.reject ? { color: "red" } : {},
                            }}
                            classNames="draper-drop"
                            disabled={CostingViewMode ? true : false}
                          />
                        </div>
                      </Col>
                      <Col md="3">
                        <div className={"attachment-wrapper"}>
                          {attachmentLoader && <LoaderCustom customClass="attachment-loader" />}
                          {files &&
                            files.map((f) => {
                              const withOutTild = f.FileURL.replace("~", "");
                              const fileURL = `${FILE_URL}${withOutTild}`;
                              return (
                                <div className={"attachment images"}>
                                  <a href={fileURL} target="_blank" rel="noreferrer">
                                    {f.OriginalFileName}
                                  </a>
                                  {
                                    !CostingViewMode &&
                                    <img
                                      alt={""}
                                      className="float-right"
                                      onClick={() => deleteFile(f.FileId, f.FileName)}
                                      src={redcrossImg}
                                    ></img>
                                  }
                                </div>
                              );
                            })}
                        </div>
                      </Col>

                    </> : <>
                      <Col md="10"><div className="left-border mt-1">Attachements:</div></Col>
                      <Col md="2" className="text-right">
                        <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setAttachmentAcc(!attachmentAcc) }}>
                          {attachmentAcc ? (
                            <i className="fa fa-minus" ></i>
                          ) : (
                            <i className="fa fa-plus"></i>
                          )}
                        </button>
                      </Col>
                      {attachmentAcc && true && <Col md="12" >
                        <Row className='mx-0 border'>
                          <Col md="12" className='height152-label'>
                            <h6 className="mt-3">Feasibility</h6>
                            <Row className='border-bottom pb-2'>
                              <Col md="6">
                                <label>Upload Attachment (upload up to 4 files)</label>
                                <div className={`alert alert-danger mt-2 ${feasibilityFiles.length === 4 ? '' : 'd-none'}`} role="alert">
                                  Maximum file upload limit has been reached.
                                </div>
                                <div className={`${feasibilityFiles.length >= 4 ? 'd-none' : ''}`}>
                                  <Dropzone
                                    ref={dropzoneFeasibility}
                                    onChangeStatus={handleChangeFeasibility}
                                    PreviewComponent={Preview}
                                    //onSubmit={this.handleSubmit}
                                    accept="image/jpeg,image/jpg,image/png,image/PNG,.xls,.doc,.pdf,.xlsx"
                                    initialFiles={initialFiles}
                                    maxFiles={4}
                                    maxSizeBytes={5000000}
                                    inputContent={(files, extra) =>
                                      extra.reject ? (
                                        "Image, audio and video files only"
                                      ) : (
                                        <div className="text-center">
                                          <i className="text-primary fa fa-cloud-upload"></i>
                                          <span className="d-block">
                                            Drag and Drop or{" "}
                                            <span className="text-primary">Browse</span>
                                            <br />
                                            file to upload
                                          </span>
                                        </div>
                                      )
                                    }
                                    styles={{
                                      dropzoneReject: {
                                        borderColor: "red",
                                        backgroundColor: "#DAA",
                                      },
                                      inputLabel: (files, extra) =>
                                        extra.reject ? { color: "red" } : {},
                                    }}
                                    className="draper-drop"
                                    disabled={CostingViewMode ? true : false}
                                  />
                                </div>
                              </Col>
                              <Col md="6">
                                <div className={"attachment-wrapper mb-3"}>
                                  {attachmentLoaderObj?.loaderFeasibility && <LoaderCustom customClass="attachment-sec-loader" />}
                                  {feasibilityFiles &&
                                    feasibilityFiles.map((f) => {
                                      const withOutTild = f?.FileURL.replace("~", "");
                                      const fileURL = `${FILE_URL}${withOutTild}`;
                                      return (
                                        <div className={"attachment images"}>
                                          <a href={fileURL} target="_blank" rel="noreferrer">
                                            {f?.OriginalFileName}
                                          </a>
                                          {!CostingViewMode && <img
                                            alt={""}
                                            className="float-right"
                                            onClick={() => deleteFileFeasibility(f?.FileId, f?.FileName)}
                                            src={redcrossImg}
                                          ></img>
                                          }
                                        </div>
                                      );
                                    })}
                                </div>
                              </Col>
                            </Row>
                          </Col>
                          <Col md="12" className='height152-label'>
                            <h6 className="mt-3">Capacity</h6>
                            <Row className='border-bottom pb-2'>
                              <Col md="6">
                                <label>Upload Attachment (upload up to 4 files)</label>
                                <div className={`alert alert-danger mt-2 ${capacityFiles.length === 4 ? '' : 'd-none'}`} role="alert">
                                  Maximum file upload limit has been reached.
                                </div>
                                <div className={`${capacityFiles.length >= 4 ? 'd-none' : ''}`}>
                                  <Dropzone
                                    ref={dropzoneCapacity}
                                    onChangeStatus={handleChangeCapacity}
                                    PreviewComponent={Preview}
                                    //onSubmit={this.handleSubmit}
                                    accept="image/jpeg,image/jpg,image/png,image/PNG,.xls,.doc,.pdf,.xlsx"
                                    initialFiles={initialFiles}
                                    maxFiles={4}
                                    maxSizeBytes={5000000}
                                    inputContent={(files, extra) =>
                                      extra.reject ? (
                                        "Image, audio and video files only"
                                      ) : (
                                        <div className="text-center">
                                          <i className="text-primary fa fa-cloud-upload"></i>
                                          <span className="d-block">
                                            Drag and Drop or{" "}
                                            <span className="text-primary">Browse</span>
                                            <br />
                                            file to upload
                                          </span>
                                        </div>
                                      )
                                    }
                                    styles={{
                                      dropzoneReject: {
                                        borderColor: "red",
                                        backgroundColor: "#DAA",
                                      },
                                      inputLabel: (files, extra) =>
                                        extra.reject ? { color: "red" } : {},
                                    }}
                                    className="draper-drop"
                                    disabled={CostingViewMode ? true : false}
                                  />
                                </div>
                              </Col>
                              <Col md="6">
                                <div className={"attachment-wrapper mb-3"}>
                                  {attachmentLoaderObj?.loaderCapacity && <LoaderCustom customClass="attachment-sec-loader" />}
                                  {capacityFiles &&
                                    capacityFiles.map((f) => {
                                      const withOutTild = f?.FileURL.replace("~", "");
                                      const fileURL = `${FILE_URL}${withOutTild}`;
                                      return (
                                        <div className={"attachment images"}>
                                          <a href={fileURL} target="_blank" rel="noreferrer">
                                            {f?.OriginalFileName}
                                          </a>
                                          {!CostingViewMode && <img
                                            alt={""}
                                            className="float-right"
                                            onClick={() => deleteFileCapacity(f?.FileId, f?.FileName)}
                                            src={redcrossImg}
                                          ></img>
                                          }
                                        </div>
                                      );
                                    })}
                                </div>
                              </Col>
                            </Row>

                          </Col>
                          <Col md="12" className='height152-label'>
                            <h6 className="mt-3">Timeline</h6>
                            <Row className='border-bottom pb-2'>
                              <Col md="6">
                                <label>Upload Attachment (upload up to 4 files)</label>
                                <div className={`alert alert-danger mt-2 ${timelineFiles.length === 4 ? '' : 'd-none'}`} role="alert">
                                  Maximum file upload limit has been reached.
                                </div>
                                <div className={`${timelineFiles.length >= 4 ? 'd-none' : ''}`}>
                                  <Dropzone
                                    ref={dropzoneTimeline}
                                    onChangeStatus={handleChangeTimeline}
                                    PreviewComponent={Preview}
                                    //onSubmit={this.handleSubmit}
                                    accept="image/jpeg,image/jpg,image/png,image/PNG,.xls,.doc,.pdf,.xlsx"
                                    initialFiles={initialFiles}
                                    maxFiles={4}
                                    maxSizeBytes={5000000}
                                    inputContent={(files, extra) =>
                                      extra.reject ? (
                                        "Image, audio and video files only"
                                      ) : (
                                        <div className="text-center">
                                          <i className="text-primary fa fa-cloud-upload"></i>
                                          <span className="d-block">
                                            Drag and Drop or{" "}
                                            <span className="text-primary">Browse</span>
                                            <br />
                                            file to upload
                                          </span>
                                        </div>
                                      )
                                    }
                                    styles={{
                                      dropzoneReject: {
                                        borderColor: "red",
                                        backgroundColor: "#DAA",
                                      },
                                      inputLabel: (files, extra) =>
                                        extra.reject ? { color: "red" } : {},
                                    }}
                                    className="draper-drop"
                                    disabled={CostingViewMode ? true : false}
                                  />
                                </div>
                              </Col>
                              <Col md="6">
                                <div className={"attachment-wrapper mb-3"}>
                                  {attachmentLoaderObj?.loaderTimeline && <LoaderCustom customClass="attachment-sec-loader" />}
                                  {timelineFiles &&
                                    timelineFiles.map((f) => {
                                      const withOutTild = f?.FileURL.replace("~", "");
                                      const fileURL = `${FILE_URL}${withOutTild}`;
                                      return (
                                        <div className={"attachment images"}>
                                          <a href={fileURL} target="_blank" rel="noreferrer">
                                            {f?.OriginalFileName}
                                          </a>
                                          {!CostingViewMode && <img
                                            alt={""}
                                            className="float-right"
                                            onClick={() => deleteFileTimeline(f?.FileId, f?.FileName)}
                                            src={redcrossImg}
                                          ></img>
                                          }
                                        </div>
                                      );
                                    })}
                                </div>
                              </Col>
                            </Row>
                          </Col>
                          <Col md="12" className='height152-label'>
                            <h6 className="mt-3">Others</h6>
                            <Row className='pb-2'>
                              <Col md="6">
                                <label>Upload Attachment (upload up to 4 files)</label>
                                <div className={`alert alert-danger mt-2 ${files.length === 4 ? '' : 'd-none'}`} role="alert">
                                  Maximum file upload limit reached.
                                </div>
                                <div className={`${files.length >= 4 ? 'd-none' : ''}`}>
                                  <Dropzone
                                    ref={dropzone}
                                    onChangeStatus={handleChangeStatus}
                                    PreviewComponent={Preview}
                                    //onSubmit={this.handleSubmit}
                                    accept="image/jpeg,image/jpg,image/png,image/PNG,.xls,.doc,.pdf,.xlsx"
                                    initialFiles={[]}
                                    maxFiles={4}
                                    maxSizeBytes={20000000}
                                    inputContent={(files, extra) =>
                                      extra.reject ? (
                                        "Image, audio and video files only"
                                      ) : (
                                        <div className="text-center">
                                          <i className="text-primary fa fa-cloud-upload"></i>
                                          <span className="d-block">
                                            Drag and Drop or{" "}
                                            <span className="text-primary">Browse</span>
                                            <br />
                                            file to upload
                                          </span>
                                        </div>
                                      )
                                    }
                                    styles={{
                                      dropzoneReject: {
                                        borderColor: "red",
                                        backgroundColor: "#DAA",
                                      },
                                      inputLabel: (files, extra) =>
                                        extra.reject ? { color: "red" } : {},
                                    }}
                                    classNames="draper-drop"
                                    disabled={CostingViewMode ? true : false}
                                  />
                                </div>
                              </Col>
                              <Col md="6">
                                <div className={"attachment-wrapper mb-3"}>
                                  {attachmentLoaderObj?.loaderAttachment && <LoaderCustom customClass="attachment-loader" />}
                                  {files &&
                                    files.map((f) => {
                                      const withOutTild = f.FileURL.replace("~", "");
                                      const fileURL = `${FILE_URL}${withOutTild}`;
                                      return (
                                        <div className={"attachment images"}>
                                          <a href={fileURL} target="_blank" rel="noreferrer">
                                            {f.OriginalFileName}
                                          </a>
                                          {
                                            !CostingViewMode &&
                                            <img
                                              alt={""}
                                              className="float-right"
                                              onClick={() => deleteFile(f.FileId, f.FileName)}
                                              src={redcrossImg}
                                            ></img>
                                          }
                                        </div>
                                      );
                                    })}
                                </div>
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                      </Col>}
                    </>
                    }







                  </Row >
                  <Row className="no-gutters justify-content-between costing-disacount-other-cost-footer sticky-btn-footer">
                    <div className="col-sm-12 text-right bluefooter-butn mt-3">

                      {
                        !CostingViewMode &&
                        <button
                          id="discountTab_save"
                          type="button"
                          className="submit-button mr5 save-btn"
                          onClick={(data, e) => { handleSubmit(onSubmit(data, e, false)) }}
                          disabled={isDisable}
                        >
                          <div className={"save-icon"}></div>
                          {"Save"}
                        </button>
                      }

                      {
                        !CostingViewMode && <button
                          type="button"
                          id="discountTab_next"
                          className="submit-button save-btn"
                          onClick={(data, e) => { handleSubmit(onSubmit(data, e, true)) }}
                          disabled={isDisable}
                        >
                          {"Next"}
                          <div className={"next-icon"}></div>
                        </button>
                      }

                    </div >
                  </Row >

                </form >
              </div >
            </Col >
          </Row >
        </div >
      </div >}
      {
        openCloseOtherCost &&
        <OtherCostDrawer
          isOpen={openCloseOtherCost}
          closeDrawer={closeOtherCostDrawer}
          anchor={'right'}
          otherCostArr={otherCostArray}
        />
      }
      {
        openCloseOtherDiscount &&
        <AddOtherDiscount
          isOpen={openCloseOtherDiscount}
          closeDrawer={closeOtherDiscountDrawer}
          anchor={'right'}
          otherCostArr={otherCostArray}
        />
      }
    </>
  );
};

export default React.memo(TabDiscountOther);
