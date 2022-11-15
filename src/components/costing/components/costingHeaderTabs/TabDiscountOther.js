import React, { useState, useEffect, useContext, useRef } from 'react';
import { useForm, Controller, } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import {
  getDiscountOtherCostTabData, saveDiscountOtherCostTab, fileUploadCosting, fileDeleteCosting,
  getExchangeRateByCurrency, setDiscountCost, setComponentDiscountOtherItemData, saveAssemblyPartRowCostingCalculation, saveAssemblyBOPHandlingCharge,
} from '../../actions/Costing';
import { getCurrencySelectList, } from '../../../../actions/Common';
import { costingInfoContext, netHeadCostContext, NetPOPriceContext } from '../CostingDetailStepTwo';
import { calculatePercentage, checkForDecimalAndNull, checkForNull, loggedInUserId, } from '../../../../helper';
import { NumberFieldHookForm, SearchableSelectHookForm, TextAreaHookForm, TextFieldHookForm } from '../../../layout/HookFormInputs';
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css';
import { ASSEMBLYNAME, FILE_URL } from '../../../../config/constants';
import Toaster from '../../../common/Toaster';
import { MESSAGES } from '../../../../config/message';
import DayTime from '../../../common/DayTimeWrapper'
import { ViewCostingContext } from '../CostingDetails';
import { useHistory } from "react-router-dom";
import redcrossImg from '../../../../assests/images/red-cross.png'
import { debounce } from 'lodash'
import { createToprowObjAndSave, formatMultiTechnologyUpdate } from '../../CostingUtil';
import { IdForMultiTechnology, ASSEMBLY } from '../../../../config/masterData';

import LoaderCustom from '../../../common/LoaderCustom';
import WarningMessage from '../../../common/WarningMessage';

import { updateMultiTechnologyTopAndWorkingRowCalculation } from '../../actions/SubAssembly';
import TooltipCustom from '../../../common/Tooltip';
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
  const dispatch = useDispatch()
  let history = useHistory();
  const costData = useContext(costingInfoContext);
  const CostingViewMode = useContext(ViewCostingContext);
  const netPOPrice = useContext(NetPOPriceContext);
  const headerCosts = useContext(netHeadCostContext);
  const currencySelectList = useSelector(state => state.comman.currencySelectList)
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const { DiscountCostData, ExchangeRateData, CostingEffectiveDate, RMCCTabData, SurfaceTabData, OverheadProfitTabData, PackageAndFreightTabData, ToolTabData, CostingDataList, getAssemBOPCharge } = useSelector(state => state.costing)

  const [totalCost, setTotalCost] = useState(0)
  const [discountObj, setDiscountObj] = useState({})
  const [otherCostApplicability, setOtherCostApplicability] = useState([])
  const [discountCostApplicability, setDiscountCostApplicability] = useState([])
  const [netPoPriceCurrencyState, setNetPoPriceCurrencyState] = useState('')
  const [attachmentLoader, setAttachmentLoader] = useState(false)
  const costingHead = useSelector(state => state.comman.costingHead)
  const partType = IdForMultiTechnology.includes(String(costData?.TechnologyId))
  const [showWarning, setShowWarning] = useState(false)
  const [isInputLoader, setIsInputLader] = useState(false)
  const { subAssemblyTechnologyArray } = useSelector(state => state.subAssembly)

  useEffect(() => {
    // CostingViewMode CONDITION IS USED TO AVOID CALCULATION IN VIEWMODE
    if (CostingViewMode === false) {
      if (props.activeTab !== '6') {

        setValue('NetPOPriceINR', discountObj !== undefined && checkForDecimalAndNull((netPOPrice - netPOPrice * calculatePercentage(discountObj.HundiOrDiscountPercentage)), initialConfiguration.NoOfDecimalForPrice))
        setValue('HundiOrDiscountPercentage', discountObj !== undefined && discountObj.HundiOrDiscountPercentage !== null ? discountObj.HundiOrDiscountPercentage : '')
        setValue('HundiOrDiscountValue', discountObj !== undefined && discountObj.DiscountCostType === 'Percentage' ? discountObj !== undefined && (netPOPrice * calculatePercentage(discountObj.HundiOrDiscountPercentage)) : discountObj?.HundiOrDiscountValue)
        setValue('AnyOtherCost', discountObj !== undefined && discountObj.AnyOtherCost)
        // setValue('HundiDiscountType',discountObj !==undefined && discountObj.DiscountCostType)

        let topHeaderData = {
          DiscountsAndOtherCost: checkForNull(discountObj?.HundiOrDiscountValue),
          HundiOrDiscountPercentage: getValues('HundiOrDiscountPercentage'),
          AnyOtherCost: checkForNull(getValues('AnyOtherCost')),
          DiscountCostType: discountObj !== undefined && discountObj.DiscountCostType,
          HundiOrDiscountValue: discountObj && checkForDecimalAndNull(discountObj.HundiOrDiscountValue !== null ? discountObj.HundiOrDiscountValue : '', initialConfiguration.NoOfDecimalForPrice),
          DiscountApplicability: discountObj && discountObj.DiscountApplicability,
          OtherCostType: otherCostType.label,
          PercentageOtherCost: discountObj.OtherCostPercentage,
          OtherCostApplicability: discountObj.OtherCostApplicability,
        }
        props.setHeaderCost(topHeaderData, headerCosts, costData)
      }
    }
  }, [netPOPrice])

  useEffect(() => {
    dispatch(getCurrencySelectList(() => { }))

  }, [])


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

      let data = {
        "CostingId": costData?.CostingId,
        "PartId": costData?.PartId,
        "PartNumber": costData?.PartNumber,
        "NetPOPrice": netPOPrice,
        "TotalCost": netPOPrice,
        "LoggedInUserId": loggedInUserId(),
        "EffectiveDate": CostingEffectiveDate,
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
          "Sequence": 0,
          "NetDiscountsCost": DiscountCostData?.HundiOrDiscountValue,
          "TotalCost": netPOPrice,
          "NetOtherCost": DiscountCostData?.AnyOtherCost,
          "OtherCostDetails": {
            "OtherCostDetailId": '',
            "HundiOrDiscountPercentage": getValues('HundiOrDiscountPercentage'),
            "HundiOrDiscountValue": DiscountCostData?.HundiOrDiscountValue,
            "AnyOtherCost": DiscountCostData?.AnyOtherCost,
            "TotalOtherCost": getValues('TotalOtherCost'),
            "TotalDiscount": DiscountCostData?.HundiOrDiscountValue,
            "IsChangeCurrency": IsCurrencyChange,
            "NetPOPriceINR": netPOPrice,
            "NetPOPriceOtherCurrency": getValues('NetPOPriceOtherCurrency'),
            "CurrencyId": currency?.value,
            "Currency": currency?.label,
            "Remark": getValues('Remarks'),
            "OtherCostDescription": getValues('OtherCostDescription'),
            "CurrencyExchangeRate": CurrencyExchangeRate,
            "EffectiveDate": effectiveDate,
            "OtherCostPercentage": '',
            "PercentageOtherCost": getValues('PercentageOtherCost'),
            "OtherCostType": otherCostType?.value,
            "DiscountCostType": hundiscountType?.value,
            "OtherCostApplicabilityId": otherCostApplicability?.value,
            "OtherCostApplicability": otherCostApplicability?.label,
            "DiscountApplicbilityId": discountCostApplicability?.value,
            "DiscountApplicability": discountCostApplicability?.label,
            "SANumber": getValues('SANumber'),
            "LineNumber": getValues('LineNumber'),
          }
        },
        "Attachements": updatedFiles,
        "IsChanged": true,
      }

      dispatch(setComponentDiscountOtherItemData(data, () => { }))
    }, 1000)
  }, [DiscountCostData])

  useEffect(() => {
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: costData.CostingId,
        PartId: costData.PartId,
      }
      dispatch(getDiscountOtherCostTabData(data, (res) => {
        if (res && res.data && res.data.Result) {
          let Data = res.data.DataList[0];
          if (Data && Data?.CostingPartDetails && Data?.CostingPartDetails?.GrandTotalCost !== null) {
            let OtherCostDetails = Data?.CostingPartDetails?.OtherCostDetails;
            setDiscountObj(OtherCostDetails)
            setIsCurrencyChange(OtherCostDetails.IsChangeCurrency ? true : false)
            setCurrencyExchangeRate(OtherCostDetails.CurrencyExchangeRate)
            setFiles(Data.Attachements ? Data.Attachements : [])
            setEffectiveDate(DayTime(OtherCostDetails.EffectiveDate).isValid() ? DayTime(OtherCostDetails.EffectiveDate) : '')
            setCurrency(OtherCostDetails.Currency !== null ? { label: OtherCostDetails.Currency, value: OtherCostDetails.CurrencyId } : [])
            setOtherCostType(OtherCostDetails.OtherCostType !== null ? { label: OtherCostDetails.OtherCostType, value: OtherCostDetails.OtherCostType } : [])
            setHundiDiscountType(OtherCostDetails.DiscountCostType !== null ? { label: OtherCostDetails.DiscountCostType, value: OtherCostDetails.DiscountCostType } : [])
            setValue('HundiOrDiscountPercentage', OtherCostDetails.HundiOrDiscountPercentage !== null ? OtherCostDetails.HundiOrDiscountPercentage : '')
            setValue('OtherCostDescription', OtherCostDetails.OtherCostDescription !== null ? OtherCostDetails.OtherCostDescription : '')
            setValue('NetPOPriceINR', OtherCostDetails.NetPOPriceINR !== null ? checkForDecimalAndNull(OtherCostDetails.NetPOPriceINR, initialConfiguration.NoOfDecimalForPrice) : '')
            setValue('HundiOrDiscountValue', OtherCostDetails.HundiOrDiscountValue !== null ? checkForDecimalAndNull(OtherCostDetails.HundiOrDiscountValue, initialConfiguration.NoOfDecimalForPrice) : '')
            setValue('AnyOtherCost', OtherCostDetails.AnyOtherCost !== null ? checkForDecimalAndNull(OtherCostDetails.AnyOtherCost, initialConfiguration.NoOfDecimalForPrice) : '')
            setValue('PercentageOtherCost', OtherCostDetails.PercentageOtherCost !== null ? OtherCostDetails.PercentageOtherCost : '')
            setValue('OtherCostType', OtherCostDetails.OtherCostType !== null ? { label: OtherCostDetails.OtherCostType, value: OtherCostDetails.OtherCostType } : '')
            setValue('HundiDiscountType', OtherCostDetails.DiscountCostType !== null ? { label: OtherCostDetails.DiscountCostType, value: OtherCostDetails.DiscountCostType } : '')
            setValue('Currency', OtherCostDetails.Currency !== null ? { label: OtherCostDetails.Currency, value: OtherCostDetails.CurrencyId } : [])
            setValue('NetPOPriceOtherCurrency', OtherCostDetails.NetPOPriceOtherCurrency !== null ? checkForDecimalAndNull(OtherCostDetails.NetPOPriceOtherCurrency, initialConfiguration.NoOfDecimalForPrice) : '')
            setNetPoPriceCurrencyState(OtherCostDetails.NetPOPriceOtherCurrency !== null ? OtherCostDetails.NetPOPriceOtherCurrency : '')
            setValue('Remarks', OtherCostDetails.Remark !== null ? OtherCostDetails.Remark : '')
            setEffectiveDate(DayTime(OtherCostDetails.EffectiveDate).isValid() ? DayTime(OtherCostDetails.EffectiveDate) : '')
            setValue('SANumber', OtherCostDetails.SANumber !== null ? OtherCostDetails.SANumber : '')
            setValue('LineNumber', OtherCostDetails.LineNumber !== null ? OtherCostDetails.LineNumber : '')
            setOtherCostApplicability({ label: OtherCostDetails.OtherCostApplicability, value: OtherCostDetails.OtherCostApplicabilityId })
            setDiscountCostApplicability({ label: OtherCostDetails.DiscountApplicability, value: OtherCostDetails.DiscountApplicbilityId })
            setValue('OtherCostApplicability', { label: OtherCostDetails.OtherCostApplicability, value: OtherCostDetails.OtherCostApplicabilityId })
            setValue('DiscountCostApplicability', { label: OtherCostDetails.DiscountApplicability, value: OtherCostDetails.DiscountApplicbilityId })

            // BELOW CONDITION UPDATES VALUES IN EDIT OR GET MODE
            const discountValues = {
              NetPOPriceINR: OtherCostDetails.NetPOPriceINR !== null ? checkForNull(OtherCostDetails.NetPOPriceINR) : '',
              HundiOrDiscountValue: OtherCostDetails.HundiOrDiscountValue !== null ? checkForNull(OtherCostDetails.HundiOrDiscountValue) : '',
              AnyOtherCost: OtherCostDetails.AnyOtherCost !== null ? checkForNull(OtherCostDetails.AnyOtherCost) : '',
              HundiOrDiscountPercentage: OtherCostDetails.HundiOrDiscountPercentage !== null ? checkForNull(OtherCostDetails.HundiOrDiscountPercentage) : '',
              DiscountCostType: OtherCostDetails.DiscountCostType !== null ? OtherCostDetails.DiscountCostType : '',
              OtherCostApplicability: OtherCostDetails.OtherCostApplicability,
              DiscountApplicability: OtherCostDetails.DiscountApplicability
            }
            dispatch(setDiscountCost(discountValues, () => { }))

            // setTimeout(() => {           // IF ANY ISSUE COME IN DISCOUNT TAB UNCOMMENT THE SETTIMEOUT ON FIRST PRIORITY AND TEST 
            let topHeaderData = {
              DiscountsAndOtherCost: checkForNull(OtherCostDetails.HundiOrDiscountValue),
              HundiOrDiscountPercentage: getValues('HundiOrDiscountPercentage'),
              AnyOtherCost: checkForNull(OtherCostDetails.AnyOtherCost),
              OtherCostType: OtherCostDetails.OtherCostType,
              PercentageOtherCost: checkForNull(OtherCostDetails.PercentageOtherCost),
              HundiOrDiscountValue: checkForNull(OtherCostDetails.HundiOrDiscountValue !== null ? OtherCostDetails.HundiOrDiscountValue : ''),
              DiscountCostType: OtherCostDetails.DiscountCostType !== null ? OtherCostDetails.DiscountCostType : '',
              OtherCostApplicability: OtherCostDetails.OtherCostApplicability,
              DiscountApplicability: OtherCostDetails.DiscountApplicability
            }

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
      NetPOPriceINR: discountObj.NetPOPriceINR !== null ? checkForNull(discountObj.NetPOPriceINR) : '',
      HundiOrDiscountValue: discountObj.HundiOrDiscountValue !== null ? checkForNull(discountObj.HundiOrDiscountValue) : '',
      AnyOtherCost: discountObj.AnyOtherCost !== null ? checkForNull(discountObj.AnyOtherCost) : '',
      HundiOrDiscountPercentage: discountObj.HundiOrDiscountPercentage !== null ? checkForNull(discountObj.HundiOrDiscountPercentage) : '',
      DiscountCostType: discountObj.DiscountCostType !== null ? discountObj.DiscountCostType : '',
      OtherCostApplicability: discountObj.OtherCostApplicability,
      DiscountApplicability: discountObj.DiscountApplicability
    }
    dispatch(setDiscountCost(discountValues, () => { }))

    setTimeout(() => {
      let topHeaderData = {
        DiscountsAndOtherCost: checkForNull(discountObj.HundiOrDiscountValue),
        HundiOrDiscountPercentage: getValues('HundiOrDiscountPercentage'),
        AnyOtherCost: checkForNull(discountObj.AnyOtherCost),
        OtherCostType: discountObj.OtherCostType,
        PercentageOtherCost: checkForNull(discountObj.PercentageOtherCost),
        HundiOrDiscountValue: checkForNull(discountObj.HundiOrDiscountValue !== null ? discountObj.HundiOrDiscountValue : ''),
        DiscountCostType: discountObj.DiscountCostType !== null ? discountObj.DiscountCostType : '',
        OtherCostApplicability: discountObj.OtherCostApplicability,
        DiscountApplicability: discountObj.DiscountApplicability
      }
      props.setHeaderCost(topHeaderData, headerCosts, costData)
    })
  }, [costData, headerCosts])

  //MANIPULATE TOP HEADER COSTS
  useEffect(() => {
    if (!CostingViewMode) {

      setValue('NetPOPriceINR', DiscountCostData && checkForDecimalAndNull(netPOPrice, initialConfiguration.NoOfDecimalForPrice))
      if (otherCostType.value === 'Percentage') {
        setValue('AnyOtherCost', DiscountCostData !== undefined ? checkForDecimalAndNull(DiscountCostData.AnyOtherCost, initialConfiguration.NoOfDecimalForPrice) : 0)
      }
      if (hundiscountType.value === 'Percentage') {
        setValue('HundiOrDiscountValue', DiscountCostData && checkForDecimalAndNull(DiscountCostData.HundiOrDiscountValue, initialConfiguration.NoOfDecimalForPrice))
      }
      if (IsCurrencyChange && ExchangeRateData !== undefined && ExchangeRateData.CurrencyExchangeRate !== undefined) {
        setValue('NetPOPriceOtherCurrency', checkForDecimalAndNull((DiscountCostData && netPOPrice / ExchangeRateData.CurrencyExchangeRate), initialConfiguration.NoOfDecimalForPrice))
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
      OtherCostType: otherCostType?.value,
      PercentageOtherCost: checkForNull(discountObj?.OtherCostPercentage),
      DiscountCostType: hundiscountType.value,
      OtherCostApplicability: discountObj.OtherCostApplicability,
      DiscountApplicability: discountObj.DiscountApplicability
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
        if (checkForNull(event.target.value) > totalCost) {
          setTimeout(() => {
            setValue('HundiOrDiscountValue', 0)
          }, 300);
          setDiscountObj({
            ...discountObj,
            HundiOrDiscountValue: 0,
            totalCost: totalCost
          })
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
        setDiscountObj({
          ...discountObj,
          HundiOrDiscountPercentage: checkForNull(event.target.value)
        })
      } else {
        Toaster.warning('Please enter valid number.')
      }
    }
  }

  /**
    * @method handleOtherCostTypeChange
    * @description  HANDLE OTHER COST TYPE CHANGE
    */
  const handleOtherCostTypeChange = (newValue) => {
    if (!CostingViewMode) {
      if (newValue && newValue !== '') {
        setOtherCostType(newValue)
        setValue('AnyOtherCost', 0)
        setValue('PercentageOtherCost', 0)
        setDiscountObj({
          ...discountObj,
          AnyOtherCost: 0,
          OtherCostPercentage: 0
        })
      } else {
        setOtherCostType([])
      }
    }
  }
  /**
    * @method handleDiscountTypeChange
    * @description  HANDLE OTHER DISCOUNT TYPE CHANGE
    */
  const handleDiscountTypeChange = (newValue) => {
    if (!CostingViewMode) {
      if (newValue && newValue !== '') {
        setHundiDiscountType(newValue)
        setValue('HundiOrDiscountValue', 0)
        setValue('HundiOrDiscountPercentage', 0)
        setValue('HundiDiscountType', newValue.value)
        setDiscountObj({
          ...discountObj,
          DiscountCostType: newValue.value
        })
      } else {
        setHundiDiscountType([])
      }
    }
  }

  /**
  * @method handleOtherCostPercentageChange
  * @description HANDLE ANY OTHER COST CHANGE
  */
  const handleOtherCostPercentageChange = (event) => {
    if (!CostingViewMode) {
      if (!isNaN(event.target.value)) {

        setDiscountObj({
          ...discountObj,
          OtherCostPercentage: checkForNull(event.target.value)
        })
      } else {
        Toaster.warning('Please enter valid number.')
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
  }

  /**
    * @method handleCurrencyChange
    * @description  RATE CRITERIA CHANGE HANDLE
    */
  const handleCurrencyChange = (newValue) => {
    if (newValue && newValue !== '') {
      setCurrency(newValue)
      setIsInputLader(true)
      dispatch(getExchangeRateByCurrency(newValue.label, DayTime(CostingEffectiveDate).format('YYYY-MM-DD'), res => {
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
          setValue('NetPOPriceOtherCurrency', checkForDecimalAndNull((NetPOPriceINR / Data.CurrencyExchangeRate), initialConfiguration.NoOfDecimalForPrice))
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
          setValue('NetPOPriceOtherCurrency', checkForDecimalAndNull((NetPOPriceINR / Data.CurrencyExchangeRate), initialConfiguration.NoOfDecimalForPrice))
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
        if (item.Value === '0' || item.Value === '8') return false;
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
    if (Number(loop) === 1) {
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

    if (errors && Object.keys(errors).length > 0) return false;

    const tabData = RMCCTabData[0]
    const surfaceTabData = SurfaceTabData[0]
    const overHeadAndProfitTabData = OverheadProfitTabData[0]
    const discountAndOtherTabData = DiscountCostData
    const packageAndFreightTabData = PackageAndFreightTabData && PackageAndFreightTabData[0]
    const toolTabData = ToolTabData && ToolTabData[0]

    let updatedFiles = files.map((file) => {
      return { ...file, ContextId: costData.CostingId }
    })
    let data = {
      "CostingId": costData.CostingId,
      "PartId": costData.PartId,
      "PartNumber": costData.PartNumber,
      "NetPOPrice": netPOPrice,
      "TotalCost": netPOPrice,
      "LoggedInUserId": loggedInUserId(),
      "EffectiveDate": CostingEffectiveDate,
      "CostingPartDetails": {
        "CostingDetailId": costData.CostingId,
        "PartId": costData.PartId,
        "PartTypeId": "00000000-0000-0000-0000-000000000000",
        "Type": costData.VendorType,
        "PartNumber": costData.PartNumber,
        "PartName": costData.PartName,
        "Quantity": 1,
        "IsOpen": true,
        "IsPrimary": true,
        "Sequence": '0',
        "NetDiscountsCost": DiscountCostData.HundiOrDiscountValue,
        "TotalCost": netPOPrice,
        "NetOtherCost": DiscountCostData.AnyOtherCost,
        "OtherCostDetails": {
          "OtherCostDetailId": '',
          "HundiOrDiscountPercentage": getValues('HundiOrDiscountPercentage'),
          "HundiOrDiscountValue": DiscountCostData.HundiOrDiscountValue,
          "AnyOtherCost": DiscountCostData.AnyOtherCost,
          "TotalOtherCost": DiscountCostData.AnyOtherCost,
          "TotalDiscount": DiscountCostData.HundiOrDiscountValue,
          "IsChangeCurrency": IsCurrencyChange,
          "NetPOPriceINR": netPOPrice,
          "NetPOPriceOtherCurrency": netPoPriceCurrencyState,
          "CurrencyId": currency.value,
          "Currency": currency.label,
          "Remark": getValues('Remarks'),
          "OtherCostDescription": getValues('OtherCostDescription'),
          "CurrencyExchangeRate": CurrencyExchangeRate,
          "EffectiveDate": effectiveDate,
          "OtherCostPercentage": getValues('PercentageOtherCost'),
          "PercentageOtherCost": getValues('PercentageOtherCost'),
          "OtherCostType": otherCostType.value,
          "SANumber": getValues('SANumber'),
          "LineNumber": getValues('LineNumber'),
          "DiscountCostType": hundiscountType.value,
          "OtherCostApplicabilityId": otherCostApplicability.value,
          "OtherCostApplicability": otherCostApplicability.label,
          "DiscountApplicbilityId": discountCostApplicability.value,
          "DiscountApplicability": discountCostApplicability.label
        }
      },
      "Attachements": updatedFiles
    }
    if (costData.IsAssemblyPart === true && !partType) {
      let assemblyRequestedData = createToprowObjAndSave(tabData, surfaceTabData, PackageAndFreightTabData, overHeadAndProfitTabData, ToolTabData, discountAndOtherTabData, netPOPrice, getAssemBOPCharge, 6, CostingEffectiveDate)
      if (!CostingViewMode) {

        dispatch(saveAssemblyPartRowCostingCalculation(assemblyRequestedData, res => { }))
      }
    }

    if (!CostingViewMode) {
      dispatch(saveDiscountOtherCostTab(data, res => {
        if (res.data.Result) {
          Toaster.success(MESSAGES.OTHER_DISCOUNT_COSTING_SAVE_SUCCESS);
          dispatch(setComponentDiscountOtherItemData({}, () => { }))
          dispatch(saveAssemblyBOPHandlingCharge({}, () => { }))
          if (gotoNextValue) {
            props.toggle('2')
            history.push('/costing-summary')
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

        let request = formatMultiTechnologyUpdate(tempsubAssemblyTechnologyArray, totalCost, surfaceTabData, overHeadAndProfitTabData, packageAndFreightTabData, toolTabData, DiscountCostData)
        dispatch(updateMultiTechnologyTopAndWorkingRowCalculation(request, res => { }))

      }
    }, 500);

  }, 500)

  const handleOherCostApplicabilityChange = (value) => {
    setOtherCostApplicability(value)
    setDiscountObj({
      ...discountObj,
      OtherCostApplicability: value.label
    })
  }

  const handleDiscountApplicabilityChange = (value) => {
    setDiscountCostApplicability(value)
    setDiscountObj({
      ...discountObj,
      DiscountApplicability: value.label
    })
  }
  const isLoaderObj = { isLoader: isInputLoader, loaderClass: "align-items-center" }
  return (
    <>
      <div className="login-container signup-form">
        <div className="p-3 costing-border w-100 border-top-0">
          <Row>
            <Col md="12">
              <div className="shadow-lgg login-formg">

                <Row className="mx-0">
                  <Col md="12" className="pt-2">
                    <Table className="table cr-brdr-main cr-bg-tbl mt-1" size="sm" >
                      <thead>
                        <tr>
                          <th className="fs1 font-weight-500 py-3 width33">{``}</th>
                          <th className="fs1 font-weight-500 py-3 width33">{``}</th>
                          {/* <th className="fs1 font-weight-500 py-3" >{`Total Cost: ${DiscountCostData && DiscountCostData.NetPOPriceINR !== undefined ? checkForDecimalAndNull(DiscountCostData.NetPOPriceINR, initialConfiguration.NoOfDecimalForPrice) : 0}`}</th> */}
                          <th className="fs1 font-weight-500 py-3" >{`Total Cost: ${totalCost && totalCost !== undefined ? checkForDecimalAndNull(totalCost, initialConfiguration.NoOfDecimalForPrice) : 0}`}</th>
                        </tr>
                      </thead>
                    </Table>
                  </Col>
                </Row>

                <form
                  noValidate
                  className="form"
                >
                  <Row className="mx-0">
                    <Col md="2">
                      <SearchableSelectHookForm
                        label={"Other Cost Type"}
                        name={"OtherCostType"}
                        placeholder={"Select"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: false }}
                        register={register}
                        defaultValue={otherCostType.length !== 0 ? otherCostType : ""}
                        options={renderListing("OtherCostType")}
                        mandatory={false}
                        handleChange={handleOtherCostTypeChange}
                        errors={errors.OtherCostType}
                        disabled={CostingViewMode ? true : false}
                      />
                    </Col>
                    {
                      otherCostType.value === 'Percentage' &&
                      <Col md="2">
                        <SearchableSelectHookForm
                          label={'Other Cost Applicability'}
                          name={'OtherCostApplicability'}
                          placeholder={'Select'}
                          Controller={Controller}
                          control={control}
                          rules={{ required: false }}
                          register={register}
                          defaultValue={otherCostApplicability.length !== 0 ? otherCostApplicability : ''}
                          options={renderListing('Applicability')}
                          mandatory={false}
                          disabled={CostingViewMode ? true : false}
                          handleChange={handleOherCostApplicabilityChange}
                          errors={errors.OtherCostApplicability}
                        />
                      </Col>
                    }
                    {
                      <Col className={`${otherCostType.value === 'Percentage' ? 'col-md-2' : 'col-md-4'}`}>
                        <NumberFieldHookForm
                          label="Percentage(%)"
                          name={"PercentageOtherCost"}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={false}
                          rules={{
                            //required: true,
                            pattern: {
                              value: /^\d*\.?\d*$/,
                              message: "Invalid Number.",
                            },
                            max: {
                              value: 100,
                              message: 'Percentage cannot be greater than 100'
                            },
                          }}
                          handleChange={(e) => {
                            e.preventDefault();
                            handleOtherCostPercentageChange(e);
                          }}
                          defaultValue={""}
                          className=""
                          customClassName={"withBorder"}
                          errors={errors.PercentageOtherCost}
                          disabled={CostingViewMode || !(otherCostType && otherCostType.value === 'Percentage') ? true : false}
                        />
                      </Col>}
                    <Col md="4" >
                      <TextFieldHookForm
                        label="Other Cost Description"
                        name={"OtherCostDescription"}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        rules={{
                          required: false,
                        }}
                        handleChange={() => { }}
                        defaultValue={""}
                        className=""
                        customClassName={"withBorder"}
                        errors={errors.OtherCostDescription}
                        disabled={CostingViewMode ? true : false}
                      />
                    </Col>
                    <Col md="2">
                      {(otherCostType.value === 'Percentage' || Object.keys(otherCostType).length === 0) && <TooltipCustom disabledIcon={true} id="other-cost" tooltipText={"Other Cost = Other Cost Applicability * Percentage / 100"} />}
                      <NumberFieldHookForm
                        label="Other Cost"
                        name={"AnyOtherCost"}
                        id="other-cost"
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        rules={{
                          //required: true,
                          pattern: {
                            value: /^\d*\.?\d*$/,
                            message: "Invalid Number.",
                          },
                        }}
                        handleChange={(e) => {
                          e.preventDefault();
                          handleAnyOtherCostChange(e);
                        }}
                        defaultValue={""}
                        className=""
                        customClassName={"withBorder"}
                        errors={errors.AnyOtherCost}
                        disabled={CostingViewMode || otherCostType.value === 'Percentage' || Object.keys(otherCostType).length === 0 ? true : false}
                      />
                    </Col>
                  </Row>
                  <Row className="mx-0">
                    <Col md="2">
                      <SearchableSelectHookForm
                        label={"Discount Type"}
                        name={"HundiDiscountType"}
                        placeholder={"Select"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: false }}
                        register={register}
                        defaultValue={hundiscountType.length !== 0 ? hundiscountType : ""}
                        options={renderListing("HundiDiscountType")}
                        mandatory={false}
                        handleChange={handleDiscountTypeChange}
                        errors={errors.HundiDiscountType}
                        disabled={CostingViewMode ? true : false}
                      />
                    </Col>
                    {
                      hundiscountType.value === 'Percentage' &&
                      <Col md="2">
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
                        />
                      </Col>
                    }
                    {
                      <Col className={`${hundiscountType.value === 'Percentage' ? 'col-md-2' : 'col-md-4'}`}>
                        <TextFieldHookForm
                          label="Discount(%)"
                          name={"HundiOrDiscountPercentage"}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={false}
                          rules={{
                            required: false,
                            pattern: {
                              value: /^\d*\.?\d*$/,
                              message: 'Invalid Number.'
                            },
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

                    <Col md="4" >
                      <TextFieldHookForm
                        label="Hundi/Discount Value"
                        name={'HundiOrDiscountValue'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        rules={{
                          pattern: {
                            value: /^\d*\.?\d*$/,
                            message: "Invalid Number.",
                          },
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
                    <Col md="2">
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
                        errors={errors.SANumber}
                        disabled={true}
                      />
                    </Col>
                    <Col md="2">
                      <TextFieldHookForm
                        label="SA Number"
                        name={'SANumber'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        rules={{}}
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
                        rules={{}}
                        handleChange={() => { }}
                        defaultValue={""}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.LineNumber}
                        disabled={CostingViewMode ? true : false}
                      />
                    </Col>
                  </Row>

                  <Row className="mx-0">
                    <Col md="2">
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
                    <Col md="2">{''}</Col>
                    {IsCurrencyChange && (
                      <>
                        <Col md="4">
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
                            handleChange={handleCurrencyChange}
                            errors={errors.Currency}
                            disabled={CostingViewMode || CostingEffectiveDate === '' ? true : false}
                          />
                          {showWarning && <WarningMessage dClass="mt-n3" message={`${currency.label} rate is not present in the Exchange Master`} />}
                        </Col>
                        <Col md="4">
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
                            customClassName={'withBorder'}
                            errors={errors.NetPOPriceOtherCurrency}
                            disabled={true}
                            isLoading={isLoaderObj}
                          />
                        </Col>
                      </>
                    )}
                  </Row>

                  <Row className="mx-0">
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
                        rows={6}
                        mandatory={false}
                        rules={{

                          maxLength: {
                            value: 500,
                            message: "Remark should be less than 500 words"
                          },
                        }}
                        handleChange={() => { }}
                        defaultValue={""}
                        className=""
                        customClassName={"textAreaWithBorder"}
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
                          accept="*"
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
                                <a href={fileURL} target="_blank">
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

                </form>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};

export default React.memo(TabDiscountOther);
