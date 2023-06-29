import React, { useState, useEffect, useContext, useRef } from 'react';
import { useForm, Controller, useWatch, } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import {
  getDiscountOtherCostTabData, saveDiscountOtherCostTab, fileUploadCosting, fileDeleteCosting,
  getExchangeRateByCurrency, setDiscountCost, setComponentDiscountOtherItemData, saveAssemblyPartRowCostingCalculation, saveAssemblyBOPHandlingCharge, setDiscountErrors, gridDataAdded, isDiscountDataChange, setNPVData, setPOPrice,
} from '../../actions/Costing';
import { getConditionDetails, getCurrencySelectList, getNpvDetails, saveCostingDetailCondition, saveCostingDetailNpv, } from '../../../../actions/Common';
import { costingInfoContext, netHeadCostContext, NetPOPriceContext } from '../CostingDetailStepTwo';
import { calculatePercentage, checkForDecimalAndNull, checkForNull, loggedInUserId, } from '../../../../helper';
import { SearchableSelectHookForm, TextAreaHookForm, TextFieldHookForm } from '../../../layout/HookFormInputs';
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css';
import { EMPTY_DATA, CRMHeads, FILE_URL, NFRTypeId, VBCTypeId } from '../../../../config/constants';
import Toaster from '../../../common/Toaster';
import { MESSAGES } from '../../../../config/message';
import DayTime from '../../../common/DayTimeWrapper'
import { IsNFR, ViewCostingContext } from '../CostingDetails';
import { Redirect, useHistory } from "react-router-dom";
import redcrossImg from '../../../../assests/images/red-cross.png'
import { debounce } from 'lodash'
import { createToprowObjAndSave, errorCheckObject, formatMultiTechnologyUpdate } from '../../CostingUtil';
import { IdForMultiTechnology, STRINGMAXLENGTH } from '../../../../config/masterData';

import LoaderCustom from '../../../common/LoaderCustom';
import WarningMessage from '../../../common/WarningMessage';
import { updateMultiTechnologyTopAndWorkingRowCalculation } from '../../actions/SubAssembly';
import TooltipCustom from '../../../common/Tooltip';
import { number, percentageLimitValidation, checkWhiteSpaces, decimalNumberLimit6, hashValidation } from "../../../../helper/validation";
import NpvCost from '../CostingHeadCosts/AdditionalOtherCost/NpvCost';
import AddNpvCost from '../CostingHeadCosts/AdditionalOtherCost/AddNpvCost';
import ConditionCosting from '../CostingHeadCosts/AdditionalOtherCost/ConditionCosting';
import AddConditionCosting from '../CostingHeadCosts/AdditionalOtherCost/AddConditionCosting';
import { reactLocalStorage } from 'reactjs-localstorage';
import OtherCostDrawer from '../CostingHeadCosts/AdditionalOtherCost/OtherCostDrawer'
import OtherCostTable from '../CostingHeadCosts/AdditionalOtherCost/OtherCosttTable';
let counter = 0;
function TabDiscountOther(props) {
  // ********* INITIALIZE REF FOR DROPZONE ********
  const dropzone = useRef(null);
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
  const { DiscountCostData, ExchangeRateData, CostingEffectiveDate, RMCCTabData, SurfaceTabData, OverheadProfitTabData, PackageAndFreightTabData, ToolTabData, CostingDataList, getAssemBOPCharge, ErrorObjDiscount } = useSelector(state => state.costing)

  const [totalCost, setTotalCost] = useState(0)
  const [discountObj, setDiscountObj] = useState({})
  const [otherCostApplicability, setOtherCostApplicability] = useState([])
  const [discountCostApplicability, setDiscountCostApplicability] = useState([])
  const [netPoPriceCurrencyState, setNetPoPriceCurrencyState] = useState('')
  const [attachmentLoader, setAttachmentLoader] = useState(false)
  const [isOpenandClose, setisOpenandClose] = useState(false)
  const [isConditionCostingOpen, setIsConditionCostingOpen] = useState(false)
  const costingHead = useSelector(state => state.comman.costingHead)
  const partType = IdForMultiTechnology.includes(String(costData?.TechnologyId))
  const [showWarning, setShowWarning] = useState(false)
  const [isInputLoader, setIsInputLader] = useState(false)
  const [npvTableData, setNpvTableData] = useState([])
  const [conditionTableData, seConditionTableData] = useState([])
  const [totalNpvCost, setTotalNpvCost] = useState(0)
  const [totalConditionCost, setTotalConditionCost] = useState(0)
  const [nfrListing, setNfrListing] = useState(false)
  const [openCloseOtherCost, setOpenCloseOtherCost] = useState(false)
  const { subAssemblyTechnologyArray } = useSelector(state => state.subAssembly)
  const { otherCostData } = useSelector(state => state.costing)
  const [otherCostArray, setOtherCostArray] = useState([])
  const isNFR = useContext(IsNFR);

  const fieldValues = useWatch({
    control,
    name: ['Remarks', 'Currency'],
  });

  useEffect(() => {
    // CostingViewMode CONDITION IS USED TO AVOID CALCULATION IN VIEWMODE
    if (CostingViewMode === false) {
      if (props.activeTab !== '6') {

        setValue('BasicRateINR', discountObj !== undefined && checkForDecimalAndNull((netPOPrice - netPOPrice * calculatePercentage(discountObj?.HundiOrDiscountPercentage) - (totalNpvCost + totalConditionCost)), initialConfiguration?.NoOfDecimalForPrice))
        setValue('NetPOPriceINR', discountObj !== undefined && checkForDecimalAndNull((netPOPrice - netPOPrice * calculatePercentage(discountObj?.HundiOrDiscountPercentage)), initialConfiguration?.NoOfDecimalForPrice))
        setValue('HundiOrDiscountPercentage', discountObj !== undefined && discountObj?.HundiOrDiscountPercentage !== null ? discountObj?.HundiOrDiscountPercentage : '')
        setValue('HundiOrDiscountValue', discountObj !== undefined && discountObj?.DiscountCostType === 'Percentage' ? discountObj !== undefined && (netPOPrice * calculatePercentage(discountObj?.HundiOrDiscountPercentage)) : discountObj?.HundiOrDiscountValue)
        setValue('AnyOtherCost', discountObj !== undefined && checkForDecimalAndNull(discountObj?.AnyOtherCost, initialConfiguration.NoOfDecimalForPrice))

        let topHeaderData = {
          DiscountsAndOtherCost: checkForNull(discountObj?.HundiOrDiscountValue),
          HundiOrDiscountPercentage: getValues('HundiOrDiscountPercentage'),
          AnyOtherCost: checkForNull(discountObj.AnyOtherCost),
          DiscountCostType: discountObj !== undefined && discountObj?.DiscountCostType,
          HundiOrDiscountValue: discountObj && checkForDecimalAndNull(discountObj?.HundiOrDiscountValue !== null ? discountObj?.HundiOrDiscountValue : '', initialConfiguration?.NoOfDecimalForPrice),
          DiscountApplicability: discountObj && discountObj?.DiscountApplicability,
          totalNpvCost: discountObj?.totalNpvCost ? discountObj?.totalNpvCost : totalNpvCost,
          totalConditionCost: discountObj?.totalConditionCost ? discountObj?.totalConditionCost : totalConditionCost,
        }

        props.setHeaderCost(topHeaderData, headerCosts, costData)
      }
    }
  }, [netPOPrice])

  useEffect(() => {
    dispatch(getCurrencySelectList(() => { }))
    return () => {
      reactLocalStorage.setObject('isFromDiscountObj', false)
      setNfrListing(false)
    }
  }, [])


  useEffect(() => {
    if (RMCCTabData && RMCCTabData[0]?.CostingId && props?.activeTab === '6') {
      let npvSum = 0
      if (initialConfiguration?.IsShowNpvCost) {
        dispatch(getNpvDetails(RMCCTabData && RMCCTabData[0]?.CostingId, (res) => {
          if (res?.data?.DataList) {
            let Data = res?.data?.DataList
            setNpvTableData(Data)
            const sum = Data.reduce((acc, obj) => Number(acc) + Number(obj.NpvCost), 0);
            setTotalNpvCost(sum)
            npvSum = sum
            dispatch(isDiscountDataChange(true))
            setDiscountObj({
              ...discountObj,
              totalNpvCost: sum
            })
          }
        }))
      }

      if (initialConfiguration?.IsBasicRateAndCostingConditionVisible) {
        dispatch(getConditionDetails(RMCCTabData && RMCCTabData[0]?.CostingId, (res) => {
          if (res?.data?.Data) {
            let Data = res?.data?.Data.ConditionsData
            let temp = []
            Data && Data.map((item) => {
              item.condition = `${item.Description} (${item.CostingConditionNumber})`
              temp.push(item)
            })
            seConditionTableData(temp)
            const sum = Data.reduce((acc, obj) => Number(acc) + Number(obj.ConditionCost), 0);
            setTotalConditionCost(sum)
            setTimeout(() => {
              dispatch(isDiscountDataChange(true))
              setDiscountObj({
                ...discountObj,
                totalConditionCost: Number(sum)
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
    }

  }, [CostingDataList])

  //USED TO SET ITEM DATA THAT WILL CALL WHEN CLICK ON OTHER TAB
  useEffect(() => {

    setTimeout(() => {

      let updatedFiles = files.map((file) => {
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
          "CRMHead": item?.CRMHead
        }
        otherCostFinalArray.push(data1)
      })

      let discountArray = [
        {
          "Type": 'Discount',
          "ApplicabilityType": discountCostApplicability?.label,
          "ApplicabilityIdRef": discountCostApplicability?.value,
          "Description": '',
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
        "Attachements": updatedFiles,
        "IsChanged": true,
      }

      dispatch(setComponentDiscountOtherItemData(data, () => { }))
    }, 1000)
  }, [DiscountCostData, fieldValues])

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

            setDiscountObj({ ...Data, ...Data?.CostingPartDetails, totalConditionCost: costDetail?.NetConditionCost, totalNpvCost: costDetail?.NetNpvCost, AnyOtherCost: costDetail.NetOtherCost !== null ? checkForNull(costDetail.NetOtherCost) : '', })

            setIsCurrencyChange(Data.IsChangeCurrency ? true : false)
            setCurrencyExchangeRate(Data.CurrencyExchangeRate)
            setFiles(Data.Attachements ? Data.Attachements : [])
            setEffectiveDate(DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '')
            setCurrency(Data.Currency !== null ? { label: Data.Currency, value: Data.CurrencyId } : [])
            setValue('HundiOrDiscountPercentage', costDetail.DiscountCostDetails[0].Value !== null ? costDetail.DiscountCostDetails[0].Value : '')
            setValue('BasicRateINR', Data.BasicRate !== null ? checkForDecimalAndNull(Data.BasicRate, initialConfiguration?.NoOfDecimalForPrice) : '')
            setValue('NetPOPriceINR', Data.NetPOPrice !== null ? checkForDecimalAndNull(Data.NetPOPrice, initialConfiguration?.NoOfDecimalForPrice) : '')
            setValue('HundiOrDiscountValue', costDetail.DiscountCostDetails[0].NetCost !== null ? checkForDecimalAndNull(costDetail.DiscountCostDetails[0].NetCost, initialConfiguration?.NoOfDecimalForPrice) : '')
            setValue('AnyOtherCost', costDetail.NetOtherCost !== null ? checkForDecimalAndNull(costDetail.NetOtherCost, initialConfiguration?.NoOfDecimalForPrice) : '')
            setValue('Currency', Data.Currency !== null ? { label: Data.Currency, value: Data.CurrencyId } : [])
            setValue('NetPOPriceOtherCurrency', Data.NetPOPriceInOtherCurrency !== null ? checkForDecimalAndNull(Data.NetPOPriceInOtherCurrency, initialConfiguration?.NoOfDecimalForPrice) : '')
            setNetPoPriceCurrencyState(Data.NetPOPriceInOtherCurrency !== null ? Data.NetPOPriceInOtherCurrency : '')
            setValue('Remarks', Data.Remark !== null ? Data.Remark : '')

            setEffectiveDate(DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '')
            let temp = []
            Data?.CostingPartDetails?.OtherCostDetails && Data?.CostingPartDetails?.OtherCostDetails.map((item) => {
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

            setDiscountCostApplicability({ label: costDetail.DiscountCostDetails[0].ApplicabilityType, value: costDetail.DiscountCostDetails[0].ApplicabilityType })
            setValue('DiscountCostApplicability', { label: costDetail.DiscountCostDetails[0].ApplicabilityType, value: costDetail.DiscountCostDetails[0].ApplicabilityType })
            setValue('crmHeadDiscount', { label: costDetail.DiscountCostDetails[0].CRMHead, value: 1 })

            // BELOW CONDITION UPDATES VALUES IN EDIT OR GET MODE
            const discountValues = {
              BasicRateINR: Data.BasicRate !== null ? checkForNull(Data.BasicRate) : '',
              NetPOPriceINR: Data.NetPOPrice !== null ? checkForNull(Data.NetPOPrice) : '',

              HundiOrDiscountValue: costDetail.DiscountCostDetails[0].NetCost !== null ? checkForNull(costDetail.DiscountCostDetails[0].NetCost) : '',
              AnyOtherCost: costDetail.NetOtherCost !== null ? checkForNull(costDetail.NetOtherCost) : '',
              HundiOrDiscountPercentage: costDetail.DiscountCostDetails[0].Value !== null ? checkForNull(costDetail.DiscountCostDetails[0].Value) : '',
              //DiscountCostType: OtherCostDetails.DiscountCostType !== null ? OtherCostDetails.DiscountCostType : '',
              // OtherCostApplicability: OtherCostDetails.OtherCostApplicability,
              DiscountApplicability: costDetail.DiscountCostDetails[0].ApplicabilityType,
              totalNpvCost: discountObj?.totalNpvCost ? discountObj?.totalNpvCost : costDetail?.NetNpvCost,
              totalConditionCost: discountObj?.totalConditionCost ? discountObj?.totalConditionCost : costDetail?.NetConditionCost,
            }
            dispatch(setDiscountCost(discountValues, () => { }))

            // setTimeout(() => {           // IF ANY ISSUE COME IN DISCOUNT TAB UNCOMMENT THE SETTIMEOUT ON FIRST PRIORITY AND TEST 
            let topHeaderData = {
              DiscountsAndOtherCost: checkForNull(costDetail.DiscountCostDetails[0].NetCost),
              HundiOrDiscountPercentage: getValues('HundiOrDiscountPercentage'),
              AnyOtherCost: checkForNull(costDetail.NetOtherCost),
              // OtherCostType: OtherCostDetails.OtherCostType,
              // PercentageOtherCost: checkForNull(OtherCostDetails.PercentageOtherCost),
              HundiOrDiscountValue: checkForNull(costDetail.DiscountCostDetails[0].NetCost !== null ? costDetail.DiscountCostDetails[0].NetCost : ''),
              //DiscountCostType: OtherCostDetails.DiscountCostType !== null ? OtherCostDetails.DiscountCostType : '',
              // OtherCostApplicability: OtherCostDetails.OtherCostApplicability,
              DiscountApplicability: costDetail.DiscountCostDetails[0].ApplicabilityType,
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
      BasicRateINR: discountObj?.NetPOPriceINR !== null ? checkForNull(discountObj?.NetPOPriceINR - (totalNpvCost + totalConditionCost)) : '',
      NetPOPriceINR: discountObj?.NetPOPriceINR !== null ? checkForNull(discountObj?.NetPOPriceINR) : '',
      HundiOrDiscountValue: discountObj?.HundiOrDiscountValue !== null ? checkForNull(discountObj?.HundiOrDiscountValue) : '',
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
        DiscountsAndOtherCost: checkForNull(discountObj?.HundiOrDiscountValue),
        HundiOrDiscountPercentage: getValues('HundiOrDiscountPercentage'),
        AnyOtherCost: checkForNull(discountObj?.AnyOtherCost),
        // OtherCostType: discountObj?.OtherCostType,
        // PercentageOtherCost: checkForNull(discountObj?.PercentageOtherCost),
        HundiOrDiscountValue: checkForNull(discountObj?.HundiOrDiscountValue !== null ? discountObj?.HundiOrDiscountValue : ''),
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

      setValue('BasicRateINR', DiscountCostData && checkForDecimalAndNull(netPOPrice - (totalNpvCost + totalConditionCost), initialConfiguration?.NoOfDecimalForPrice))
      setValue('NetPOPriceINR', DiscountCostData && checkForDecimalAndNull(netPOPrice, initialConfiguration?.NoOfDecimalForPrice))
      // if (otherCostType.value === 'Percentage') {
      //   setValue('AnyOtherCost', DiscountCostData !== undefined ? checkForDecimalAndNull(DiscountCostData.AnyOtherCost, initialConfiguration?.NoOfDecimalForPrice) : 0)
      // }
      if (hundiscountType.value === 'Percentage') {
        setValue('HundiOrDiscountValue', DiscountCostData && checkForDecimalAndNull(DiscountCostData.HundiOrDiscountValue, initialConfiguration?.NoOfDecimalForPrice))
      }
      if (IsCurrencyChange && ExchangeRateData !== undefined && ExchangeRateData.CurrencyExchangeRate !== undefined) {
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
      DiscountsAndOtherCost: checkForNull(discountObj?.HundiOrDiscountValue),
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

    if (label === 'Currency') {
      currencySelectList && currencySelectList.map(item => {
        if (item.Value === '0' || item.Text === 'INR') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
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
      return temp;
    }

  }

  /**
  * @method setDisableFalseFunction
  * @description setDisableFalseFunction
  */
  const setDisableFalseFunction = () => {
    const loop = Number(dropzone.current.files.length) - Number(files.length)
    if (Number(loop) === 1 || Number(dropzone.current.files.length) === Number(files.length)) {
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
    if (errorCheckObject(ErrorObjDiscount)) return false;

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
        "CRMHead": item?.CRMHead
      }
      otherCostFinalArray.push(data1)
    })

    let discountArray = [
      {
        "Type": 'Discount',
        "ApplicabilityType": discountCostApplicability?.label,
        "ApplicabilityIdRef": discountCostApplicability?.value,
        "Description": '',
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
      "Attachements": updatedFiles
    }
    if (costData.IsAssemblyPart === true && !partType) {
      let assemblyRequestedData = createToprowObjAndSave(tabData, surfaceTabData, PackageAndFreightTabData, overHeadAndProfitTabData, ToolTabData, discountAndOtherTabData, netPOPrice, getAssemBOPCharge, 6, CostingEffectiveDate)
      if (!CostingViewMode) {
        dispatch(saveAssemblyPartRowCostingCalculation(assemblyRequestedData, res => { }))
        dispatch(isDiscountDataChange(false))
      }
    }

    if (!CostingViewMode) {
      dispatch(saveDiscountOtherCostTab(data, res => {
        if (res.data.Result) {
          Toaster.success(MESSAGES.OTHER_DISCOUNT_COSTING_SAVE_SUCCESS);
          dispatch(setComponentDiscountOtherItemData({}, () => { }))
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
    }

    setTimeout(() => {
      if (partType) {

        let tempsubAssemblyTechnologyArray = subAssemblyTechnologyArray[0]
        tempsubAssemblyTechnologyArray.CostingPartDetails.NetOtherCost = DiscountCostData.AnyOtherCost
        tempsubAssemblyTechnologyArray.CostingPartDetails.NetDiscounts = DiscountCostData.HundiOrDiscountValue

        let totalCost = (checkForNull(tempsubAssemblyTechnologyArray?.CostingPartDetails?.TotalCalculatedRMBOPCCCost) +
          checkForNull(surfaceTabData?.CostingPartDetails?.NetSurfaceTreatmentCost) +
          checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
          checkForNull(ToolTabData && ToolTabData[0]?.CostingPartDetails?.TotalToolCost) +
          checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.NetOverheadAndProfitCost) +
          checkForNull(DiscountCostData?.AnyOtherCost)) -
          checkForNull(DiscountCostData?.HundiOrDiscountValue)

        let request = formatMultiTechnologyUpdate(tempsubAssemblyTechnologyArray, totalCost, surfaceTabData, overHeadAndProfitTabData, packageAndFreightTabData, toolTabData, DiscountCostData, CostingEffectiveDate)
        dispatch(updateMultiTechnologyTopAndWorkingRowCalculation(request, res => { }))
        dispatch(gridDataAdded(true))
        dispatch(isDiscountDataChange(false))
        dispatch(setComponentDiscountOtherItemData({}, () => { }))

      }
    }, 500);

  }, 500)


  const handleDiscountApplicabilityChange = (value) => {

    if (!CostingViewMode) {
      if (value && value !== '') {
        dispatch(isDiscountDataChange(true))
        setHundiDiscountType(value.label !== 'Fixed' ? { label: 'Percentage', value: 'Percentage' } : value)
        setValue('HundiOrDiscountValue', 0)
        setValue('HundiOrDiscountPercentage', 0)
        setValue('HundiDiscountType', value.value)
        errors.HundiOrDiscountValue = {}
        errors.HundiOrDiscountPercentage = {}
        setDiscountObj({
          ...discountObj,
          DiscountCostType: value.value !== 'Fixed' ? 'Percentage' : value.value
        })
      } else {
        setHundiDiscountType([])
      }
      errors.HundiOrDiscountPercentage = {}
    }


    dispatch(isDiscountDataChange(true))
    setDiscountCostApplicability(value)
    setDiscountObj({
      ...discountObj,
      DiscountApplicability: value.label
    })
  }
  const isLoaderObj = { isLoader: isInputLoader, loaderClass: "align-items-center" }

  if (Object.keys(errors).length > 0 && counter < 2) {
    counter = counter + 1;
    dispatch(setDiscountErrors(errors))
  } else if (Object.keys(errors).length === 0 && counter > 0) {
    counter = 0
    dispatch(setDiscountErrors({}))
  }

  const resetData = (type) => {
    switch (type) {
      case 'other':
        return function resetField() {
          setValue('OtherCostApplicability', '')
          setValue('PercentageOtherCost', '')
          setValue('OtherCostDescription', '')
          setValue('AnyOtherCost', '')
          setOtherCostApplicability([])
          dispatch(isDiscountDataChange(true))
          setDiscountObj({
            ...discountObj,
            AnyOtherCost: 0,
            OtherCostPercentage: 0,
            OtherCostType: '',
            OtherCostApplicability: '',
          })
        }

      case 'discount':
        return function resetField() {
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

      default:
        break;
    }
  }

  const setUpdatednetPoPrice = (data) => {
    dispatch(setNPVData([]))
    const sum = data.reduce((acc, obj) => Number(acc) + Number(obj.NpvCost), 0);
    setTotalNpvCost(sum)
    dispatch(isDiscountDataChange(true))
    setDiscountObj({
      ...discountObj,
      totalNpvCost: sum
    })

    if (data) {
      let obj = {}
      obj.CostingId = RMCCTabData && RMCCTabData[0]?.CostingId
      obj.LoggedInUserId = loggedInUserId()
      obj.NpvDetails = data
      dispatch(saveCostingDetailNpv(obj, () => { }))
    }
  }

  const openAndCloseAddNpvDrawer = (type, data = npvTableData) => {
    if (type === 'Open') {
      setisOpenandClose(true)
    } else {
      setisOpenandClose(false)
      setNpvTableData(data)
      dispatch(setNPVData([]))
      const sum = data.reduce((acc, obj) => Number(acc) + Number(obj.NpvCost), 0);
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
  const openAndCloseAddConditionCosting = (type, data = conditionTableData) => {
    if (type === 'Open') {
      setIsConditionCostingOpen(true)
    } else {
      setIsConditionCostingOpen(false)
      seConditionTableData(data)
      const sum = data.reduce((acc, obj) => Number(acc) + Number(obj.ConditionCost), 0);
      setTotalConditionCost(sum)
      dispatch(isDiscountDataChange(true))
      setDiscountObj({
        ...discountObj,
        totalConditionCost: Number(sum)
      })

      if (type === 'save') {
        if (data) {
          let obj = {}
          obj.CostingId = RMCCTabData && RMCCTabData[0]?.CostingId
          obj.LoggedInUserId = loggedInUserId()
          obj.ConditionsData = data
          dispatch(saveCostingDetailCondition(obj, () => { }))
        }
      }

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
      if (item?.ConditionType === "Fixed") {
        finalValue = item?.ConditionCost
      } else if (item?.ConditionType === "Percentage") {
        finalValue = checkForNull((item?.Percentage) / 100) * checkForNull(getValues('BasicRateINR'))
      }
      let tempObject = { ...item, ConditionCost: finalValue }
      finalListCondition.push(tempObject)
    })
    seConditionTableData(finalListCondition)
    const sum = finalListCondition.reduce((acc, obj) => Number(acc) + Number(obj.ConditionCost), 0);

    if (finalListCondition) {
      let obj = {}
      obj.CostingId = RMCCTabData && RMCCTabData[0]?.CostingId
      obj.LoggedInUserId = loggedInUserId()
      obj.ConditionsData = finalListCondition
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
      totalConditionCost: Number(sum),
      totalNpvCost: Number(sumNPV)
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

  return (
    <>
      {!nfrListing && <div className="login-container signup-form">
        <div className="p-3 costing-border w-100 border-top-0">
          <Row>
            <Col md="12">
              <div className="shadow-lgg login-formg">
                {/* //  check here @ashok */}
                <Row>
                  <Col md={12}>
                    <div className='tab-disount-total-cost mt-4'>
                      <span >Total Cost:</span>
                      <TooltipCustom width={"300px"} disabledIcon={true} id={'total-cost-tab-discount'} tooltipText={'Total Cost = Net RM BOP CC + SurfaceTreatment Cost + Overheads&Profit Cost + Packaging&Freight Cost + Tool Cost'} />
                      <p id={'total-cost-tab-discount'} className='disabled-input-data'>{`${totalCost && totalCost !== undefined ? checkForDecimalAndNull(totalCost, initialConfiguration.NoOfDecimalForPrice) : 0}`}</p>
                      <button type="button" id="overhead-refresh" className={'refresh-icon ml-2'} onClick={() => refreshAllData()}></button>
                      <TooltipCustom disabledIcon={true} id="overhead-refresh" tooltipText="Refresh to update Discount, Other cost and PO Price" />
                    </div>
                  </Col>
                </Row>
                <form
                  noValidate
                  className="form"
                >
                  <Row>
                    {
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
                          buttonCross={resetData('discount')}
                        />
                      </Col>
                    }
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
                              message: 'Percentage cannot be greater than 100'
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
                    }

                    <Col md="3" >
                      <TextFieldHookForm
                        label="Hundi/Discount Value"
                        name={'HundiOrDiscountValue'}
                        Controller={Controller}
                        control={control}
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
                        customClassName={'withBorder'}
                        errors={errors.HundiOrDiscountValue}
                        disabled={CostingViewMode || hundiscountType.value === 'Percentage' || Object.keys(hundiscountType).length === 0 ? true : false}
                      />
                    </Col>
                    <Col md="3">
                      <TextFieldHookForm
                        label="Basic Price (INR)"
                        name={'BasicRateINR'}
                        Controller={Controller}
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
                        hidden={initialConfiguration?.IsBasicRateAndCostingConditionVisible ? false : true}
                      />
                    </Col>
                  </Row>

                  <Row>
                    <Col md="8"><div className="left-border mt-1">Other Cost:</div></Col>
                    <Col md="4" className="text-right">
                      <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setOtherCotAcc(!otherCostAcc) }}>
                        {conditionAcc ? (
                          <i className="fa fa-minus" ></i>
                        ) : (
                          <i className="fa fa-plus"></i>
                        )}
                      </button>
                    </Col>
                  </Row>
                  {otherCostAcc &&
                    <Row>
                      {!CostingViewMode && <Col md="12">
                        <div className='d-flex justify-content-end mb-2'>
                          <button
                            type="button"
                            className={"user-btn"}
                            onClick={() => handleOtherCostdrawer()}
                            title="Add"
                          >
                            <div className={"plus mr-1"}></div> Add
                          </button>
                        </div>
                      </Col>}
                      <OtherCostTable tableData={{ gridData: otherCostData.gridData, otherCostTotal: otherCostData.otherCostTotal }} />
                    </Row>}
                  {initialConfiguration?.IsBasicRateAndCostingConditionVisible && <Row>
                    <Col md="8"><div className="left-border mt-1">Costing Condition:</div></Col>
                    <Col md="4" className="text-right">
                      <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setConditionAcc(!conditionAcc) }}>
                        {conditionAcc ? (
                          <i className="fa fa-minus" ></i>
                        ) : (
                          <i className="fa fa-plus"></i>
                        )}
                      </button>
                    </Col>
                  </Row>}
                  {initialConfiguration?.IsBasicRateAndCostingConditionVisible && conditionAcc && <div className='mb-2'><Row>
                    {!CostingViewMode && <Col md="12">
                      <div className='d-flex justify-content-end mb-2'>
                        <button
                          type="button"
                          className={"user-btn"}
                          onClick={() => openAndCloseAddConditionCosting('Open')}
                          title="Add"
                        >
                          <div className={"plus mr-1"}></div> Add
                        </button>
                      </div>
                    </Col>}
                  </Row>
                    <ConditionCosting hideAction={true} tableData={conditionTableData} /></div>}
                  {
                    initialConfiguration?.IsBasicRateAndCostingConditionVisible && conditionAcc && <div className='mb-2'><Row>
                      {!CostingViewMode && <Col md="12">
                        <div className='d-flex justify-content-end mb-2'>
                          <button
                            type="button"
                            className={"user-btn"}
                            onClick={() => openAndCloseAddConditionCosting('Open')}
                            title="Add"
                          >
                            <div className={"plus mr-1"}></div> Add
                          </button>
                        </div>
                      </Col>}
                    </Row>
                      <ConditionCosting hideAction={true} tableData={conditionTableData} /></div>
                  }
                  {
                    initialConfiguration?.IsBasicRateAndCostingConditionVisible &&
                    isConditionCostingOpen && <AddConditionCosting
                      isOpen={isConditionCostingOpen}
                      tableData={conditionTableData}
                      closeDrawer={openAndCloseAddConditionCosting}
                      anchor={'right'}
                      netPOPrice={netPOPrice}
                      basicRate={getValues('BasicRateINR')}
                    />
                  }
                  {
                    initialConfiguration?.IsShowNpvCost && <Row>
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
                    </Row>
                  }
                  {
                    initialConfiguration?.IsShowNpvCost && npvAcc && <>
                      {!CostingViewMode && <Row className=''>
                        <Col md="12">
                          <div className='d-flex justify-content-end mb-2'>
                            <button
                              type="button"
                              className={"user-btn"}
                              onClick={() => openAndCloseAddNpvDrawer('Open')}
                              title="Add"
                            // disabled={isDisable}
                            >
                              <div className={"plus mr-1"}></div> Add
                            </button>
                          </div>
                        </Col>
                      </Row>}

                      {initialConfiguration?.IsShowNpvCost && !isOpenandClose && <NpvCost netPOPrice={netPOPrice} tableData={npvTableData} hideAction={true} />}
                    </>
                  }
                  {
                    initialConfiguration?.IsShowNpvCost && isOpenandClose && <AddNpvCost
                      isOpen={isOpenandClose}
                      tableData={npvTableData}
                      closeDrawer={openAndCloseAddNpvDrawer}
                      anchor={'right'}
                      netPOPrice={netPOPrice - totalNpvCost}
                    />
                  }
                  <Row className="mt-2">
                    <Col md="3">
                      <TextFieldHookForm
                        label="Net PO Price (INR)"
                        name={'NetPOPriceINR'}
                        Controller={Controller}
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
                    <Col md="2" className={`mt20 pt-3`}>
                      <label
                        className={`custom-checkbox`}
                        onChange={onPressChangeCurrency}
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
                            label={`Net PO Price${Object.keys(currency).length > 0 ? '(' + currency.label + ')' : ''}`}
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
                        {'Remarks & Attachments:'}
                      </div>
                    </Col>

                    <Col md="6">
                      <TextAreaHookForm
                        label="Remarks & Attachments:"
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
                            message: "Remark should be less than 500 words"
                          },
                        }}
                        handleChange={() => { dispatch(isDiscountDataChange(true)) }}
                        defaultValue={""}
                        className=""
                        customClassName={"withBorder"}
                        errors={errors.Remarks}
                        disabled={CostingViewMode ? true : false}
                      />
                    </Col>

                    <Col md="3" className="height152-label">
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
                  </Row>
                  <Row className="no-gutters justify-content-between costing-disacount-other-cost-footer sticky-btn-footer">
                    <div className="col-sm-12 text-right bluefooter-butn mt-3">

                      {!CostingViewMode && <button
                        type="button"
                        className="submit-button mr5 save-btn"
                        onClick={(data, e) => { handleSubmit(onSubmit(data, e, false)) }}
                        disabled={isDisable}
                      >
                        <div className={"save-icon"}></div>
                        {"Save"}
                      </button>}

                      {!CostingViewMode && <button
                        type="button"
                        className="submit-button save-btn"
                        onClick={(data, e) => { handleSubmit(onSubmit(data, e, true)) }}
                        disabled={isDisable}
                      >
                        {"Next"}
                        <div className={"next-icon"}></div>
                      </button>}

                    </div>
                  </Row>

                </form >
              </div >
            </Col >
          </Row >
        </div >

// check here @ashok      </div >}
      {
        openCloseOtherCost &&
        <OtherCostDrawer
          isOpen={openCloseOtherCost}
          closeDrawer={closeOtherCostDrawer}
          anchor={'right'}
          otherCostArr={otherCostArray}
        />
      }
    </>
  );
};

export default React.memo(TabDiscountOther); 
