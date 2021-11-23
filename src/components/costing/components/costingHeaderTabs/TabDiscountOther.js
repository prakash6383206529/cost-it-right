import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller, } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import {
  getDiscountOtherCostTabData, saveDiscountOtherCostTab, fileUploadCosting, fileDeleteCosting,
  getExchangeRateByCurrency, setDiscountCost, setComponentDiscountOtherItemData, saveAssemblyPartRowCostingCalculation,
} from '../../actions/Costing';
import { getCurrencySelectList, } from '../../../../actions/Common';
import { costingInfoContext, NetPOPriceContext } from '../CostingDetailStepTwo';
import { calculatePercentage, checkForDecimalAndNull, checkForNull, loggedInUserId, } from '../../../../helper';
import { NumberFieldHookForm, SearchableSelectHookForm, TextAreaHookForm, TextFieldHookForm } from '../../../layout/HookFormInputs';
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css';
import { FILE_URL } from '../../../../config/constants';
import Toaster from '../../../common/Toaster';
import { MESSAGES } from '../../../../config/message';
import DayTime from '../../../common/DayTimeWrapper'
import { ViewCostingContext } from '../CostingDetails';
import { useHistory } from "react-router-dom";
import redcrossImg from '../../../../assests/images/red-cross.png'

function TabDiscountOther(props) {

  const { register, handleSubmit, setValue, getValues, formState: { errors }, control } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const [IsCurrencyChange, setIsCurrencyChange] = useState(false);
  const [currency, setCurrency] = useState([]);
  const [files, setFiles] = useState([]);
  const [IsOpen, setIsOpen] = useState(false);
  const [initialFiles, setInitialFiles] = useState([]);
  const [effectiveDate, setEffectiveDate] = useState('');
  const [CurrencyExchangeRate, setCurrencyExchangeRate] = useState('');
  const [GoToNext, setGoToNext] = useState(false);
  const [otherCostType, setOtherCostType] = useState([]);
  const [hundiscountType, setHundiDiscountType] = useState([])

  const dispatch = useDispatch()
  let history = useHistory();

  const costData = useContext(costingInfoContext);
  const CostingViewMode = useContext(ViewCostingContext);
  const netPOPrice = useContext(NetPOPriceContext);

  const currencySelectList = useSelector(state => state.comman.currencySelectList)
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const { DiscountCostData, ExchangeRateData, CostingEffectiveDate, RMCCTabData, SurfaceTabData, OverheadProfitTabData, PackageAndFreightTabData, ToolTabData } = useSelector(state => state.costing)


  useEffect(() => {
    // CostingViewMode CONDITION IS USED TO AVOID CALCULATION IN VIEWMODE
    if (CostingViewMode === false) {
      if (props.activeTab !== '6') {
        setValue('NetPOPriceINR', DiscountCostData !== undefined && checkForDecimalAndNull((netPOPrice - netPOPrice * calculatePercentage(DiscountCostData.HundiOrDiscountPercentage)), initialConfiguration.NoOfDecimalForPrice))
        setValue('HundiOrDiscountPercentage', DiscountCostData !== undefined && DiscountCostData.HundiOrDiscountPercentage !== null ? DiscountCostData.HundiOrDiscountPercentage : '')
        setValue('HundiOrDiscountValue', DiscountCostData !== undefined && DiscountCostData.DiscountCostType === 'Percentage' ? DiscountCostData !== undefined && (netPOPrice * calculatePercentage(DiscountCostData.HundiOrDiscountPercentage)) : DiscountCostData?.HundiOrDiscountValue)
        setValue('AnyOtherCost', DiscountCostData !== undefined && DiscountCostData.AnyOtherCost)
        // setValue('HundiDiscountType',DiscountCostData !==undefined && DiscountCostData.DiscountCostType)

        let topHeaderData = {
          DiscountsAndOtherCost: checkForNull(getValues('HundiOrDiscountValue'), 2),
          HundiOrDiscountPercentage: getValues('HundiOrDiscountPercentage'),
          AnyOtherCost: checkForNull(getValues('AnyOtherCost')),
          DiscountCostType: checkForNull(DiscountCostData !== undefined && DiscountCostData.DiscountCostType),
          HundiOrDiscountValue: DiscountCostData && checkForDecimalAndNull(DiscountCostData.HundiOrDiscountValue !== null ? DiscountCostData.HundiOrDiscountValue : '', initialConfiguration.NoOfDecimalForPrice),
        }
        props.setHeaderCost(topHeaderData)
      }
    }
  }, [netPOPrice])

  useEffect(() => {
    dispatch(getCurrencySelectList(() => { }))
  }, [])

  //USED TO SET ITEM DATA THAT WILL CALL WHEN CLICK ON OTHER TAB
  useEffect(() => {
    setTimeout(() => {

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
          "Sequence": 0,
          "NetDiscountsCost": getValues('HundiOrDiscountValue'),
          "TotalCost": getValues('NetPOPriceINR'),
          "NetOtherCost": getValues('AnyOtherCost'),
          "OtherCostDetails": {
            "OtherCostDetailId": '',
            "HundiOrDiscountPercentage": getValues('HundiOrDiscountPercentage'),
            "HundiOrDiscountValue": getValues('HundiOrDiscountValue'),
            "AnyOtherCost": getValues('AnyOtherCost'),
            "TotalOtherCost": getValues('TotalOtherCost'),
            "TotalDiscount": getValues('HundiOrDiscountValue'),
            "IsChangeCurrency": IsCurrencyChange,
            "NetPOPriceINR": getValues('NetPOPriceINR'),
            "NetPOPriceOtherCurrency": getValues('NetPOPriceOtherCurrency'),
            "CurrencyId": currency.value,
            "Currency": currency.label,
            "Remark": getValues('Remarks'),
            "OtherCostDescription": getValues('OtherCostDescription'),
            "CurrencyExchangeRate": CurrencyExchangeRate,
            "EffectiveDate": effectiveDate,
            "OtherCostPercentage": '',
            "PercentageOtherCost": getValues('PercentageOtherCost'),
            "OtherCostType": otherCostType.value,
            "DiscountCostType": hundiscountType.value
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
          if (Data && Data.CostingPartDetails && Data.CostingPartDetails.GrandTotalCost !== null) {
            let OtherCostDetails = Data.CostingPartDetails.OtherCostDetails;

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
            setValue('HundiOrDiscountValue', OtherCostDetails.HundiOrDiscountValue !== null ? OtherCostDetails.HundiOrDiscountValue : '')
            setValue('AnyOtherCost', OtherCostDetails.AnyOtherCost !== null ? OtherCostDetails.AnyOtherCost : '')
            setValue('PercentageOtherCost', OtherCostDetails.PercentageOtherCost !== null ? OtherCostDetails.PercentageOtherCost : '')
            setValue('OtherCostType', OtherCostDetails.OtherCostType !== null ? { label: OtherCostDetails.OtherCostType, value: OtherCostDetails.OtherCostType } : '')
            setValue('HundiDiscountType', OtherCostDetails.DiscountCostType !== null ? { label: OtherCostDetails.DiscountCostType, value: OtherCostDetails.DiscountCostType } : '')

            setValue('Currency', OtherCostDetails.Currency !== null ? { label: OtherCostDetails.Currency, value: OtherCostDetails.CurrencyId } : [])
            setValue('NetPOPriceOtherCurrency', OtherCostDetails.NetPOPriceOtherCurrency !== null ? OtherCostDetails.NetPOPriceOtherCurrency : '')
            setValue('Remarks', OtherCostDetails.Remark !== null ? OtherCostDetails.Remark : '')
            setEffectiveDate(DayTime(OtherCostDetails.EffectiveDate).isValid() ? DayTime(OtherCostDetails.EffectiveDate) : '')

            // BELOW CONDITION UPDATES VALUES IN EDIT OR GET MODE
            const discountValues = {
              NetPOPriceINR: checkForDecimalAndNull(OtherCostDetails.NetPOPriceINR !== null ? OtherCostDetails.NetPOPriceINR : '', initialConfiguration.NoOfDecimalForPrice),
              HundiOrDiscountValue: checkForDecimalAndNull(OtherCostDetails.HundiOrDiscountValue !== null ? OtherCostDetails.HundiOrDiscountValue : '', initialConfiguration.NoOfDecimalForPrice),
              AnyOtherCost: checkForDecimalAndNull(OtherCostDetails.AnyOtherCost !== null ? OtherCostDetails.AnyOtherCost : '', initialConfiguration.NoOfDecimalForPrice),
              HundiOrDiscountPercentage: OtherCostDetails.HundiOrDiscountPercentage !== null ? OtherCostDetails.HundiOrDiscountPercentage : '',
              DiscountCostType: OtherCostDetails.DiscountCostType !== null ? OtherCostDetails.DiscountCostType : ''
            }
            dispatch(setDiscountCost(discountValues, () => { }))

            setTimeout(() => {
              let topHeaderData = {
                DiscountsAndOtherCost: checkForNull(getValues('HundiOrDiscountValue'), 2),
                HundiOrDiscountPercentage: getValues('HundiOrDiscountPercentage'),
                AnyOtherCost: checkForNull(OtherCostDetails.AnyOtherCost),
                OtherCostType: OtherCostDetails.OtherCostType,
                PercentageOtherCost: checkForNull(OtherCostDetails.PercentageOtherCost),
                HundiOrDiscountValue: checkForDecimalAndNull(OtherCostDetails.HundiOrDiscountValue !== null ? OtherCostDetails.HundiOrDiscountValue : '', initialConfiguration.NoOfDecimalForPrice),
                DiscountCostType: OtherCostDetails.DiscountCostType !== null ? OtherCostDetails.DiscountCostType : ''
              }
              props.setHeaderCost(topHeaderData)

            }, 1500)
          }
        }
      }))
    }
  }, [costData]);

  //MANIPULATE TOP HEADER COSTS
  useEffect(() => {
    if (!CostingViewMode) {
      setValue('NetPOPriceINR', DiscountCostData && checkForDecimalAndNull(netPOPrice, initialConfiguration.NoOfDecimalForPrice))
      setValue('HundiOrDiscountValue', DiscountCostData && DiscountCostData.HundiOrDiscountValue)
      if (otherCostType.value === 'Percentage') {
        setValue('AnyOtherCost', DiscountCostData !== undefined ? DiscountCostData.AnyOtherCost : 0)
      }
      if (hundiscountType.value === 'Percentage') {
        setValue('HundiOrDiscountPercentage', DiscountCostData && DiscountCostData.HundiOrDiscountPercentage)
      }

      if (IsCurrencyChange && ExchangeRateData !== undefined && ExchangeRateData.CurrencyExchangeRate !== undefined) {
        setValue('NetPOPriceOtherCurrency', checkForDecimalAndNull((DiscountCostData && netPOPrice / ExchangeRateData.CurrencyExchangeRate), initialConfiguration.NoOfDecimalForPrice))
      }
      // setValue('HundiDiscountType', DiscountCostData.DiscountCostType !== null ? { label: DiscountCostData.DiscountCostType, value: DiscountCostData.DiscountCostType } : '')
    }
  }, [props]);

  /**
  * @method handleDiscountChange
  * @description HANDLE DISCOUNT CHANGE
  */
  const handleDiscountChange = (event) => {
    if (!CostingViewMode) {
      if (!isNaN(event.target.value)) {

        let topHeaderData = {
          DiscountsAndOtherCost: checkForDecimalAndNull(getValues('HundiOrDiscountValue'), initialConfiguration.NoOfDecimalForPrice),
          HundiOrDiscountPercentage: checkForNull(event.target.value),
          AnyOtherCost: checkForNull(getValues('AnyOtherCost')),
          DiscountCostType: hundiscountType.value
        }
        props.setHeaderCost(topHeaderData)

      } else {
        Toaster.warning('Please enter valid number.')
      }
    }
  }

  /**
  * @method handleAnyOtherCostChange
  * @description HANDLE ANY OTHER COST CHANGE
  */
  const handleAnyOtherCostChange = (event) => {
    if (!CostingViewMode) {
      if (!isNaN(event.target.value)) {

        let topHeaderData = {
          DiscountsAndOtherCost: checkForNull(getValues('HundiOrDiscountValue')),
          HundiOrDiscountPercentage: checkForNull(getValues('HundiOrDiscountPercentage')),
          AnyOtherCost: checkForNull(event.target.value),
        }
        props.setHeaderCost(topHeaderData)

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
    console.log("COMING IN discount", event.target.value);
    if (!CostingViewMode) {
      if (!isNaN(event.target.value)) {
        let topHeaderData = {
          DiscountsAndOtherCost: checkForNull(event.target.value),
          HundiOrDiscountPercentage: checkForNull(getValues('HundiOrDiscountPercentage')),
          AnyOtherCost: checkForNull(getValues('AnyOtherCost')),
          DiscountCostType: hundiscountType.value
        }
        props.setHeaderCost(topHeaderData)

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
        let topHeaderData = {
          DiscountsAndOtherCost: checkForNull(getValues('HundiOrDiscountValue')),
          HundiOrDiscountPercentage: checkForNull(getValues('HundiOrDiscountPercentage')),
          AnyOtherCost: 0,
          OtherCostType: newValue.value,
          PercentageOtherCost: 0,
        }
        props.setHeaderCost(topHeaderData)
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
        let topHeaderData = {
          DiscountsAndOtherCost: checkForNull(getValues('HundiOrDiscountValue')),
          HundiOrDiscountPercentage: checkForNull(getValues('HundiOrDiscountPercentage')),
          AnyOtherCost: checkForNull(getValues('AnyOtherCost')),
          OtherCostType: otherCostType.value,
          PercentageOtherCost: checkForNull(getValues('PercentageOtherCost')),
          DiscountCostType: newValue.value
        }
        props.setHeaderCost(topHeaderData)
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

        let topHeaderData = {
          DiscountsAndOtherCost: checkForNull(getValues('HundiOrDiscountValue')),
          HundiOrDiscountPercentage: checkForNull(getValues('HundiOrDiscountPercentage')),
          AnyOtherCost: checkForNull(event.target.value),
          OtherCostType: Object.keys(otherCostType).length > 0 ? otherCostType.value : '',
          PercentageOtherCost: checkForNull(event.target.value),
        }
        props.setHeaderCost(topHeaderData)

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
    setCurrency([])
    setIsCurrencyChange(!IsCurrencyChange)
  }

  /**
    * @method handleCurrencyChange
    * @description  RATE CRITERIA CHANGE HANDLE
    */
  const handleCurrencyChange = (newValue) => {
    if (newValue && newValue !== '') {
      setCurrency(newValue)
      //let ReqParams = { Currency: newValue.label, EffectiveDate: moment(effectiveDate).local().format('DD-MM-YYYY') }
      dispatch(getExchangeRateByCurrency(newValue.label, DayTime(CostingEffectiveDate).format('YYYY-MM-DD'), res => {
        if (res && res.data && res.data.Result) {
          let Data = res.data.Data;
          const NetPOPriceINR = getValues('NetPOPriceINR');
          setValue('NetPOPriceOtherCurrency', checkForDecimalAndNull((NetPOPriceINR / Data.CurrencyExchangeRate), initialConfiguration.NoOfDecimalForPrice))
          setCurrencyExchangeRate(Data.CurrencyExchangeRate)
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

  }

  // specify upload params and url for your files
  const getUploadParams = ({ file, meta }) => {
    return { url: 'https://httpbin.org/post', }
  }

  // called every time a file's `status` changes
  const handleChangeStatus = ({ meta, file }, status) => {

    if (status === 'removed') {
      const removedFileName = file.name;
      let tempArr = files && files.filter(item => item.OriginalFileName !== removedFileName)
      setFiles(tempArr)
      setIsOpen(!IsOpen)
    }

    if (status === 'done') {
      let data = new FormData()
      data.append('file', file)
      dispatch(fileUploadCosting(data, (res) => {
        let Data = res.data[0]
        files.push(Data)
        setFiles(files)
        setIsOpen(!IsOpen)
      }))
    }

    if (status === 'rejected_file_type') {
      Toaster.warning('Allowed only xls, doc, jpeg, pdf files.')
    }
  }

  const deleteFile = (FileId, OriginalFileName) => {
    if (FileId != null) {
      let deleteData = {
        Id: FileId,
        DeletedBy: loggedInUserId(),
      }
      dispatch(fileDeleteCosting(deleteData, (res) => {
        Toaster.success('File has been deleted successfully.')
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
  }

  const Preview = ({ meta }) => {
    const { name, percent, status } = meta
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
  const onSubmit = (values) => {
    const tabData = RMCCTabData[0]
    const surfaceTabData = SurfaceTabData[0]
    const overHeadAndProfitTabData = OverheadProfitTabData[0]
    const discountAndOtherTabData = DiscountCostData
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
        "NetDiscountsCost": values.HundiOrDiscountValue,
        "TotalCost": values.NetPOPriceINR,
        "NetOtherCost": values.AnyOtherCost,
        "OtherCostDetails": {
          "OtherCostDetailId": '',
          "HundiOrDiscountPercentage": values.HundiOrDiscountPercentage,
          "HundiOrDiscountValue": values.HundiOrDiscountValue,
          "AnyOtherCost": values.AnyOtherCost,
          "TotalOtherCost": values.TotalOtherCost,
          "TotalDiscount": values.HundiOrDiscountValue,
          "IsChangeCurrency": IsCurrencyChange,
          "NetPOPriceINR": values.NetPOPriceINR,
          "NetPOPriceOtherCurrency": values.NetPOPriceOtherCurrency,
          "CurrencyId": currency.value,
          "Currency": currency.label,
          "Remark": values.Remarks,
          "OtherCostDescription": values.OtherCostDescription,
          "CurrencyExchangeRate": CurrencyExchangeRate,
          "EffectiveDate": effectiveDate,
          "OtherCostPercentage": '',
          "PercentageOtherCost": values.PercentageOtherCost,
          "OtherCostType": otherCostType.value,
          "DiscountCostType": hundiscountType.value
        }
      },
      "Attachements": updatedFiles
    }
    if (costData.IsAssemblyPart === true) {

      let assemblyRequestedData = {
        "TopRow": {
          "CostingId": tabData.CostingId,
          "CostingNumber": tabData.CostingNumber,
          "TotalRawMaterialsCostWithQuantity": tabData.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
          "TotalBoughtOutPartCostWithQuantity": tabData.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
          "TotalConversionCostWithQuantity": tabData.CostingPartDetails?.TotalConversionCostWithQuantity,
          "TotalCalculatedRMBOPCCCostPerPC": tabData.CostingPartDetails?.TotalRawMaterialsCostWithQuantity + tabData.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity + tabData.CostingPartDetails?.TotalConversionCostWithQuantity,
          "TotalCalculatedRMBOPCCCostPerAssembly": tabData.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
          "NetRMCostPerAssembly": tabData.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
          "NetBOPCostAssembly": tabData.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
          "NetConversionCostPerAssembly": tabData.CostingPartDetails?.TotalConversionCostWithQuantity,
          "NetRMBOPCCCost": tabData.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
          "SurfaceTreatmentCostPerAssembly": surfaceTabData.CostingPartDetails?.SurfaceTreatmentCost,
          "TransportationCostPerAssembly": surfaceTabData.CostingPartDetails?.TransportationCost,
          "TotalSurfaceTreatmentCostPerAssembly": surfaceTabData.CostingPartDetails?.NetSurfaceTreatmentCost,
          "NetSurfaceTreatmentCost": surfaceTabData.CostingPartDetails?.NetSurfaceTreatmentCost,
          "NetOverheadAndProfits": overHeadAndProfitTabData.CostingPartDetails?.NetOverheadAndProfitCost,
          "NetPackagingAndFreightCost": PackageAndFreightTabData && PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost,
          "NetToolCost": ToolTabData[0]?.CostingPartDetails?.TotalToolCost,
          "NetOtherCost": discountAndOtherTabData?.AnyOtherCost,
          "NetDiscounts": discountAndOtherTabData?.HundiOrDiscountValue,
          "TotalCostINR": netPOPrice,
          "TabId": 6
        },
        "WorkingRows": [],
        "LoggedInUserId": loggedInUserId()

      }

      dispatch(saveAssemblyPartRowCostingCalculation(assemblyRequestedData, res => { }))
    }

    dispatch(saveDiscountOtherCostTab(data, res => {
      if (res.data.Result) {
        Toaster.success(MESSAGES.OTHER_DISCOUNT_COSTING_SAVE_SUCCESS);
        dispatch(setComponentDiscountOtherItemData({}, () => { }))
        if (GoToNext) {
          props.toggle('2')
          history.push('/costing-summary')
        }
      }
    }))
  }

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
                          <th className="fs1 font-weight-500 py-3" style={{ width: "33.33%" }}>{``}</th>
                          <th className="fs1 font-weight-500 py-3" style={{ width: "33%.33" }}>{``}</th>
                          {/* <th className="fs1 font-weight-500 py-3" >{`Total Cost: ${DiscountCostData && DiscountCostData.NetPOPriceINR !== undefined ? checkForDecimalAndNull(DiscountCostData.NetPOPriceINR, initialConfiguration.NoOfDecimalForPrice) : 0}`}</th> */}
                          <th className="fs1 font-weight-500 py-3" >{`Total Cost: ${DiscountCostData && DiscountCostData.NetPOPriceINR !== undefined ? checkForDecimalAndNull(getValues('NetPOPriceINR'), initialConfiguration.NoOfDecimalForPrice) : 0}`}</th>
                        </tr>
                      </thead>
                    </Table>
                  </Col>
                </Row>

                <form
                  noValidate
                  className="form"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <Row className="mx-0">
                    <Col md="2">
                      <SearchableSelectHookForm
                        label={"Hundi/Other Discount Type"}
                        name={"HundiDiscountType"}
                        placeholder={"-Select-"}
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
                      hundiscountType && hundiscountType.value === 'Percentage' &&

                      <Col md="4" >
                        <TextFieldHookForm
                          label="Hundi/Other Discount(%)"
                          name={"HundiOrDiscountPercentage"}
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
                            max: {
                              value: 100,
                              message: 'Percentage cannot be greater than 100'
                            },
                          }}
                          handleChange={(e) => {
                            e.preventDefault();
                            handleDiscountChange(e);
                          }}
                          defaultValue={""}
                          className=""
                          customClassName={"withBorder"}
                          errors={errors.HundiOrDiscountPercentage}
                          disabled={CostingViewMode ? true : false}
                        />
                      </Col>
                    }
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
                    <Col md="4">
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
                  </Row>

                  <Row className="mx-0">
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
                      <SearchableSelectHookForm
                        label={"Other Cost Type"}
                        name={"OtherCostType"}
                        placeholder={"-Select-"}
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
                    {otherCostType && otherCostType.value === 'Percentage' &&
                      <Col md="1" >
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
                          disabled={CostingViewMode ? true : false}
                        />
                      </Col>}
                    <Col md="2">
                      <NumberFieldHookForm
                        label="Other Cost"
                        name={"AnyOtherCost"}
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

                    <Col md="4">

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
                            placeholder={"-Select-"}
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
                        rules={{}}
                        handleChange={() => { }}
                        defaultValue={""}
                        className=""
                        customClassName={"withBorder"}
                        errors={errors.Remarks}
                        disabled={CostingViewMode ? true : false}
                      />
                    </Col>

                    <Col md="3" className="height152-label">
                      <label>Upload Attachment (upload up to 4 files)</label>
                      {files && files.length >= 4 ? (
                        <div class="alert alert-danger" role="alert">
                          Maximum file upload limit has been reached.
                        </div>
                      ) : (
                        <Dropzone
                          getUploadParams={getUploadParams}
                          onChangeStatus={handleChangeStatus}
                          PreviewComponent={Preview}
                          //onSubmit={this.handleSubmit}
                          accept="*"
                          initialFiles={initialFiles}
                          maxFiles={4}
                          maxSizeBytes={2000000000}
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
                      )}
                    </Col>
                    <Col md="3">
                      <div className={"attachment-wrapper"}>
                        {files &&
                          files.map((f) => {
                            const withOutTild = f.FileURL.replace("~", "");
                            const fileURL = `${FILE_URL}${withOutTild}`;
                            return (
                              <div className={"attachment images"}>
                                <a href={fileURL} target="_blank" rel="noreferrer">
                                  {f.OriginalFileName}
                                </a>
                                <img
                                  alt={""}
                                  className="float-right"
                                  onClick={() => deleteFile(f.FileId, f.FileName)}
                                  src={redcrossImg}
                                ></img>
                              </div>
                            );
                          })}
                      </div>
                    </Col>
                  </Row>


                  <Row className="no-gutters justify-content-between costing-disacount-other-cost-footer">
                    <div className="col-sm-12 text-right bluefooter-butn mt-3">

                      {!CostingViewMode && <button
                        type={"submit"}
                        className="submit-button mr5 save-btn"
                        onClick={() => setGoToNext(false)}
                      >
                        <div className={"save-icon"}></div>
                        {"Save"}
                      </button>}

                      {!CostingViewMode && <button
                        type="submit"
                        className="submit-button save-btn"
                        onClick={() => setGoToNext(true)}
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