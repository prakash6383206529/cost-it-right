import React, { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, FormGroup, Label, Input } from "reactstrap";
import { AsyncSearchableSelectHookForm, SearchableSelectHookForm, TextFieldHookForm, DatePickerHookForm, AllApprovalField, } from "../layout/HookFormInputs";

import { MESSAGES } from "../../config/message";

import HeaderTitle from "../common/HeaderTitle";

import _, { debounce } from "lodash";
import { technology } from "../../helper/Dummy";

import Switch from 'react-switch'
import { required, calculatePercentageValue, checkForDecimalAndNull, checkForNull, checkWhiteSpaces, extenstionTime, decimalNumberLimit, maxPercentageValue, number, acceptAllExceptSingleSpecialCharacter, maxLength70, hashValidation, calculateEndDate, userDetails, loggedInUserId, getTimeZone, calculateEndDateTime, durationTimeDropdown, calculatePercentageFromValue } from "../../helper";
import DatePicker from 'react-datepicker'
import { setHours, setMinutes } from 'date-fns';
import DayTime from "../common/DayTimeWrapper";
import { getQuotationById } from "./actions/rfq";
import { auctionRfqSelectList, checkQuatationForAuction, createAuction } from "./actions/RfqAuction";
import { EMPTY_GUID } from "../../config/constants";
import Toaster from "../common/Toaster";
import { useHistory, useLocation } from "react-router-dom/cjs/react-router-dom";
import { useLabels } from "../../helper/core";
export const RM = 'Raw Material'
export const BOP = 'Bought Out Part'
export const COMPONENT = 'Component'
export const ASSEMBLY = 'Assembly'

function AddAuction(props) {
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
    control,
  } = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const currentDate = new Date()
  const currentHours = currentDate.getHours();
  const currentMinutes = currentDate.getMinutes();
  //states
  const [state, setState] = useState({
    isViewFlag: false,
    drawerOpen: false,
    comparsionAuction: false,
    selectedPriceZoneType: "priceZone%",
    selectedType: "%",
    comparsionData: {},
    vendorName: '',
    PartType: '',
    reductionPrice: false,
    priceZoneReduction: false,
    PartList: [],
    RawMaterialList: [],
    BoughtOutPartList: [],
    formData: [],
    VendorList: [],
    VendorIdList: [],
    PlantList: [],
    loader: false,
    initiateFromRfq: false
  })
  const [calculationState, setCalculationState] = useState({
    BasePrice: '',
    ReductionPrice: '',
    ReductionPercent: '',
    YellowZoneReductionPrice: '',
    YellowZoneReductionPercent: '',
    GreenZoneReductionPrice: '',
    GreenZoneReductionPercent: '',
  })
  const [dateAndTimeState, setDateAndTimeState] = useState({
    dateAndTime: '',
    minHours: currentHours,
    minMinutes: currentMinutes,

  })
  const { technologyLabel } = useLabels();
  // useSelectors
  const { RFQSelectlist } = useSelector(state => state.Auction);
  const { NoOfDecimalForPrice } = useSelector((state) => state.auth?.initialConfiguration) || {}

  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    const { source, quotationId } = location.state || {};
    if (source === 'rfq') {
      getDataByQuatationId(quotationId)
      setState(prevState => ({ ...prevState, initiateFromRfq: true }))
    } else {
      dispatch(auctionRfqSelectList(() => { }))
    }
  }, [])

  const renderListing = (label) => {
    let temp = [];
    if (label === 'PartType') {
      temp = temp
    } else if (label === 'Technology') {
      temp = technology
    } else if (label === 'RFQNumber') {
      RFQSelectlist.length !== 0 && RFQSelectlist.map((item) => {
        temp.push({ label: item.Text, value: item.Value })
      })
    }
    return temp
  };

  /**
   * @method cancel
   * @description used to Reset form
   */
  const cancel = () => {
    if (location.state && location.state.source === 'auction') {
      history.push('/reverse-auction');
    } else if (location.state && location.state.source === 'rfq') {
      history.push({
        pathname: '/rfq-listing',
        state: { viewRfq: true, source: 'auction', quotationId: location.state.quotationId }
      });
    } else {
      history.push('/');
    }
  };
  const onSubmit = (value) => {
    let data = {};
    data.AuctionName = value.AuctionName
    data.QuotationPartId = state.QuotationPartId;
    data.QuotationAuctionId = EMPTY_GUID
    data.LoggedInUserId = loggedInUserId()
    data.AuctionRaisedOnTimeZone = getTimeZone();
    data.VendorId = state.VendorIdList
    data.AuctionDuration = value?.AuctionDuration?.label ?? "00:00"
    data.ExtensionTime = value.ExtensionTime.label
    data.AuctionStartDateTime = dateAndTimeState.dateAndTime
    data.MinimumReductionApplicabilityType = state.reductionPrice ? 'Fixed' : 'Percentage'
    data.PriceZoneApplicabilityType = state.priceZoneReduction ? 'Fixed' : 'Percentage'
    data.AuctionEndDateTime = calculateEndDateTime(dateAndTimeState.dateAndTime, String(value?.AuctionDuration?.label ?? "00:00"))
    data.AuctionStartDateTimeUTC = ''
    data.AuctionEndDateTimeUTC = ''

    let finalObj = { ...data, ...calculationState }
    dispatch(createAuction(finalObj, (res) => {
      if (res.data.Result) {
        Toaster.success("Auction has been created successfully")
        history.push({
          pathname: '/reverse-auction',
          state: { source: 'auction' }
        })
      }
    }))

  };


  useEffect(() => {
    setState(prevState => ({ ...prevState, selectedType: '%', selectedPriceZoneType: 'priceZone%' }));
  }, []);

  const reductionPriceToggle = (type) => {
    if (type === 'basePrice') {
      setState(prevState => ({ ...prevState, reductionPrice: !state.reductionPrice }))
    } else if (type === 'priceZone') {
      setState(prevState => ({ ...prevState, priceZoneReduction: !state.priceZoneReduction }))
    }
  }
  const calculateReversePercentage = (value) => {
    const basePrice = checkForNull(getValues('BasePrice')) ?? 0
    const calculatedValue = calculatePercentageValue(basePrice, value)
    const returnValue = basePrice - checkForNull(calculatedValue)
    return returnValue;
  }
  const calculateReverseValue = (value) => {
    const basePrice = checkForNull(getValues('BasePrice')) ?? 0
    const inputPrice = basePrice - value;
    const returnValue = (inputPrice * 100) / basePrice
    return returnValue;
  }
  const basePriceHandle = (event) => {
    const getValue = checkForNull(event.target.value)
    setCalculationState(prevState => ({ ...prevState, BasePrice: getValue }))
    const calculationFields = ['ReductionPercent', 'ReductionPrice', 'ReductionPrice', 'ReductionPercent', 'YellowZoneReductionPrice', 'YellowZoneReductionPercent', 'GreenZoneReductionPrice', 'GreenZoneReductionPercent']
    calculationFields.map(item => {
      setValue(item, '')
      setCalculationState(prevState => ({ ...prevState, [item]: 0 }))
    })
  }


  const calculateBasePriceValueAndPer = (event) => {
    if (!state.reductionPrice) {
      const eventValue = checkForNull(event.target.value)
      const ReductionPrice = calculatePercentageValue(calculationState.BasePrice, eventValue)

      setValue('ReductionPrice', checkForDecimalAndNull(ReductionPrice, NoOfDecimalForPrice))
      setCalculationState(prevState => ({ ...prevState, ReductionPrice: ReductionPrice, ReductionPercent: eventValue }))
    } else if (state.reductionPrice) {
      const eventValue = checkForNull(event.target.value)
      const ReductionPercent = calculatePercentageFromValue(calculationState.BasePrice, eventValue)
      setValue('ReductionPercent', checkForDecimalAndNull(ReductionPercent, NoOfDecimalForPrice))
      setCalculationState(prevState => ({ ...prevState, ReductionPercent: ReductionPercent, ReductionPrice: eventValue }))
    }
  }

  const debouncedPriceZoneCalculation = useCallback(
    debounce((reverseKey, mainKey, value) => {
      const getMainValue = checkForNull(value);
      if (!state.priceZoneReduction) {
        const returnValue = calculateReversePercentage(value)
        setValue(reverseKey, checkForDecimalAndNull(returnValue, NoOfDecimalForPrice))
        setCalculationState(prevState => ({ ...prevState, [reverseKey]: returnValue, [mainKey]: getMainValue }))
      } else {
        const returnValue = calculateReverseValue(value)
        setValue(reverseKey, checkForDecimalAndNull(returnValue, NoOfDecimalForPrice))
        setCalculationState(prevState => ({ ...prevState, [reverseKey]: returnValue, [mainKey]: getMainValue }))
      }
      delete errors[reverseKey];
    }, 300),
    [state.priceZoneReduction]
  );
  const PriceZoneCalculation = (reverseKey, mainKey, value) => {
    debouncedPriceZoneCalculation(reverseKey, mainKey, value);
  };

  const getPartListFromType = (arr, num, QuatationPartId) => {
    let temp = [];
    arr.length !== 0 && arr.map(item => {
      let rmObj = {}
      if (num === "RawMaterialName") {
        rmObj.RawMaterialCode = item.RawMaterialCode;
        rmObj.RawMaterialGrade = item.RawMaterialGrade
        rmObj.RawMaterialSpecification = item.RawMaterialSpecification
      }
      let BopObj = {}
      if (num === 'BoughtOutPartName') {
        BopObj.BoughtOutPartNumber = item.BoughtOutPartNumber
        BopObj.BoughtOutPartCategoryName = item.BoughtOutPartCategoryName

      }
      temp.push({ label: item[num], value: item[QuatationPartId], QuotationPartId: item[QuatationPartId], ...rmObj, ...BopObj })
    })
    return temp;
  }
  const partLabel = ['PartNumber']
  const rmLabel = ['RawMaterialName', 'RawMaterialCode', 'RawMaterialGrade', 'RawMaterialSpecification'];
  const boplabel = ['BopName', 'BoughtOutPartNumber', 'BoughtOutPartCategoryName']

  const reset = (...arr) => {
    arr.map(item => {
      setValue(item, '')
      return null
    })
  }
  const getDataByQuatationId = (id) => {
    dispatch(getQuotationById(id, (res) => {
      if (res?.data?.Data) {
        let data = res?.data?.Data
        const PlantList = data?.PlantId ? [{ label: data?.PlantName, value: data?.PlantId }] : [];
        let VendorList = [];
        let VendorIdList = [];
        const PartList = getPartListFromType(data?.PartList, 'PartNumber', 'QuotationPartId')
        const RawMaterialList = getPartListFromType(data?.RawMaterialList, 'RawMaterialName', 'QuotationPartId')
        const BoughtOutPartList = getPartListFromType(data?.BoughtOutPartList, 'BoughtOutPartName', 'QuotationPartId')
        data?.VendorList.length !== 0 && data?.VendorList.map(item => {
          VendorList.push({ label: item.Vendor, value: item.VendorId })
          VendorIdList.push(item.VendorId)
        })
        setValue('PartType', data?.PartType)
        setValue('RFQNumber', { label: data?.QuotationNumber, value: data?.QuotationId })
        if (data?.PartType !== BOP) {
          setValue('Technology', data?.Technology)
        }
        setState(prevState => ({ ...prevState, PlantList: PlantList, VendorList: VendorList, VendorIdList: VendorIdList, PartList: PartList, RawMaterialList: RawMaterialList, BoughtOutPartList: BoughtOutPartList, PartType: data?.PartType }))
      }
    })
    )
  }
  const RFQHandler = (newValue) => {
    reset(...partLabel, ...rmLabel, ...boplabel)
    getDataByQuatationId(newValue.value)
  }

  const handleChangeDateAndTime = (value) => {
    const localCurrentDate = new Date();
    if (localCurrentDate.toLocaleDateString() !== value.toLocaleDateString()) {
      setDateAndTimeState(prevState => ({ ...prevState, minMinutes: 0, minHours: 0, dateAndTime: DayTime(value).format('YYYY-MM-DD HH:mm:ss') }))
    } else {
      setDateAndTimeState(prevState => ({ ...prevState, minMinutes: currentMinutes, minHours: currentHours }))

      if (value.getHours() > currentHours ? true : value.getMinutes() > currentMinutes) {
        setDateAndTimeState(prevState => ({ ...prevState, dateAndTime: DayTime(value).format('YYYY-MM-DD HH:mm:ss') }))

      } else {
        const selectedDateTime = setHours(setMinutes(value, new Date().getMinutes()), new Date().getHours());
        setDateAndTimeState(prevState => ({ ...prevState, dateAndTime: DayTime(selectedDateTime).format('YYYY-MM-DD HH:mm:ss') }))
      }
    }
  }
  const handlePartChange = (newValue, PartType) => {
    if (newValue) {
      setState(prevState => ({ ...prevState, QuotationPartId: newValue.QuotationPartId }))
    }
    const arrIteration = (arr) => {
      arr.forEach((key, index) => {
        if (index !== 0) {
          setValue(key, newValue?.[key])
        }
      });
    }
    dispatch(checkQuatationForAuction(newValue.QuotationPartId, res => {
      if (res.data) {
        setValue('BasePrice', checkForDecimalAndNull(res.data?.Data?.BasePrice, NoOfDecimalForPrice))
        setCalculationState(prevState => ({ ...prevState, BasePrice: res.data?.Data?.BasePrice }))
        if (PartType === RM) {
          if (newValue) {
            arrIteration(rmLabel)
          }
        } else if (PartType === BOP) {
          if (newValue) {
            arrIteration(boplabel)
          }
        }
      } else {
        reset(...partLabel, ...rmLabel, ...boplabel)
        setValue('BasePrice', '')
        setCalculationState(prevState => ({ ...prevState, BasePrice: 0 }))
      }
    }))
  }
  const durationHandle = (event) => {

  }
  return (
    <>
      <div className="container-fluid">
        <div className="signup-form">
          <div className="row">
            <div className="col-md-12">
              <div className="shadow-lgg login-formg">
                <div className="row">
                  <div className="col-md-6">
                    <h1>
                      {state.isViewFlag ? "View" : props?.isEditFlag ? "Update" : "Add"} Auction
                    </h1>
                  </div>
                </div>
                <div>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <Row className="part-detail-wrapper">
                      <Col md="3">
                        <TextFieldHookForm
                          // title={titleObj.descriptionTitle}
                          label="Auction Name"
                          name={"AuctionName"}
                          Controller={Controller}
                          control={control}
                          register={register}
                          rules={{
                            required: true,
                            validate: { required, acceptAllExceptSingleSpecialCharacter, maxLength70, hashValidation },
                          }}
                          mandatory={true}
                          handleChange={() => { }}
                          defaultValue={""}
                          className=""
                          customClassName={"withBorder"}
                          errors={errors.AuctionName}
                        />
                      </Col>
                      <Col md="3">
                        <SearchableSelectHookForm
                          label={"RFQ No."}
                          name={"RFQNumber"}
                          placeholder={"Select"}
                          Controller={Controller}
                          control={control}
                          rules={{ required: true }}
                          register={register}
                          options={renderListing("RFQNumber")}
                          mandatory={true}
                          handleChange={(e) => RFQHandler(e)}
                          errors={errors.RFQNumber}
                          disabled={state.initiateFromRfq}
                        />
                      </Col>
                      <Col className="col-3">
                        <TextFieldHookForm
                          label={"Part Type"}
                          name={"PartType"}
                          Controller={Controller}
                          control={control}
                          register={register}
                          rules={{
                            required: false,
                            validate: {},
                          }}
                          mandatory={false}
                          handleChange={() => { }}
                          defaultValue={state.PartType}
                          className=""
                          customClassName={"withBorder"}
                          errors={errors.PartType}
                          disabled={true}
                        />
                      </Col>
                      {(state.PartType === COMPONENT || state.PartType === ASSEMBLY) && <Col md="3" className="d-flex align-items-center">
                        <SearchableSelectHookForm
                          label={"Part No"}
                          name={"PartNumber"}
                          placeholder={"Select"}
                          Controller={Controller}
                          control={control}
                          rules={{ required: true }}
                          register={register}
                          defaultValue={""}
                          options={state.PartList}
                          mandatory={true}
                          handleChange={(e) => handlePartChange(e, COMPONENT)}
                          errors={errors.PartNumber}
                          disabled={false}
                        />
                      </Col>}
                      {state.PartType === RM && <> <Col md="3">
                        <SearchableSelectHookForm
                          label={"RM Name"}
                          name={"RawMaterialName"}
                          placeholder={"Select"}
                          Controller={Controller}
                          control={control}
                          rules={{ required: true }}
                          register={register}
                          defaultValue={""}
                          options={state.RawMaterialList}
                          mandatory={true}
                          handleChange={(e) => handlePartChange(e, RM)}
                          errors={errors.RawMaterialName}
                          disabled={false}
                        />
                      </Col>
                        <Col md="3">
                          <TextFieldHookForm
                            label={"RM Grade"}
                            name={"RawMaterialGrade"}
                            Controller={Controller}
                            control={control}
                            register={register}
                            rules={{
                              required: false,
                              validate: {},
                            }}
                            mandatory={false}
                            handleChange={() => { }}
                            defaultValue={''}
                            className=""
                            customClassName={"withBorder"}
                            // handleChange={handlePlant}
                            errors={errors.RawMaterialGrade}
                            disabled={true}
                          />
                        </Col>
                        <Col md="3">
                          <TextFieldHookForm
                            label={"RM Specification"}
                            name={"RawMaterialSpecification"}
                            Controller={Controller}
                            control={control}
                            register={register}
                            rules={{
                              required: false,
                              validate: {},
                            }}
                            mandatory={false}
                            handleChange={() => { }}
                            defaultValue={''}
                            className=""
                            customClassName={"withBorder"}
                            errors={errors.RawMaterialSpecification}
                            disabled={true}
                          />
                        </Col>
                        <Col md="3">
                          <TextFieldHookForm
                            label={"RM Code"}
                            name={"RawMaterialCode"}
                            Controller={Controller}
                            control={control}
                            register={register}
                            rules={{
                              required: false,
                              validate: {},
                            }}
                            mandatory={false}
                            handleChange={() => { }}
                            defaultValue={''}
                            className=""
                            customClassName={"withBorder"}
                            errors={errors.RawMaterialCode}
                            disabled={true}
                          />
                        </Col></>}

                      {state.PartType === BOP && <>
                        <Col md="3">
                          <SearchableSelectHookForm
                            label={"BOP Name"}
                            name={"BopName"}
                            placeholder={"Select"}
                            Controller={Controller}
                            control={control}
                            rules={{ required: true }}
                            register={register}
                            options={state.BoughtOutPartList}
                            mandatory={true}
                            handleChange={(e) => handlePartChange(e, BOP)}
                            errors={errors.BopName}
                            disabled={false}
                          />
                        </Col>
                        <Col md="3">
                          <TextFieldHookForm
                            label={"BOP No."}
                            name={"BoughtOutPartNumber"}
                            Controller={Controller}
                            control={control}
                            register={register}
                            rules={{
                              required: false,
                              validate: {},
                            }}
                            mandatory={false}
                            handleChange={() => { }}
                            defaultValue={''}
                            className=""
                            customClassName={"withBorder"}
                            errors={errors.BoughtOutPartNumber}
                            disabled={true}
                          />
                        </Col>
                        <Col md="3">
                          <TextFieldHookForm
                            label={"Category"}
                            name={"BoughtOutPartCategoryName"}
                            Controller={Controller}
                            control={control}
                            register={register}
                            rules={{
                              required: false,
                              validate: {},
                            }}
                            mandatory={false}
                            handleChange={() => { }}
                            defaultValue={''}
                            className=""
                            customClassName={"withBorder"}
                            errors={errors.BoughtOutPartCategoryName}
                            disabled={true}
                          />
                        </Col></>}
                      {!state.PartType === BOP && <Col md="3">
                        <TextFieldHookForm
                          label={technologyLabel}
                          name={"Technology"}
                          Controller={Controller}
                          control={control}
                          register={register}
                          rules={{
                            required: false,
                            validate: {},
                          }}
                          mandatory={false}
                          handleChange={() => { }}
                          defaultValue={''}
                          className=""
                          customClassName={"withBorder"}
                          errors={errors.Technology}
                          disabled={false}
                        />
                      </Col>}

                      <Col md="3">
                        <AllApprovalField
                          label="Vendor (Code)"
                          approverList={state.VendorList}
                          popupButton="View all"
                        />
                      </Col>
                      <Col md="3">
                        <AllApprovalField
                          label="Plant (Code)"
                          approverList={state.PlantList}
                          popupButton="View all"
                        />
                      </Col>

                      <Col md="3">
                        <div className="inputbox date-section">
                          <div className="form-group">
                            <label>Date & Time</label>
                            <div className="inputbox date-section rfq-calendar">
                              <DatePicker
                                name="StartPlanDate"
                                selected={DayTime(dateAndTimeState.dateAndTime).isValid() ? new Date(dateAndTimeState.dateAndTime) : null}
                                onChange={handleChangeDateAndTime}

                                showMonthDropdown
                                showYearDropdown
                                dropdownMode='select'
                                minDate={new Date()}
                                timeFormat='HH:mm'
                                dateFormat="dd/MM/yyyy HH:mm"
                                minTime={setHours(setMinutes(new Date(), dateAndTimeState.minMinutes), dateAndTimeState.minHours)}
                                maxTime={setHours(setMinutes(new Date(), 59), 23)}
                                placeholderText="Select"
                                className="withBorder "
                                autoComplete={'off'}
                                showTimeSelect={true}
                                timeIntervals={1}
                                errors={errors.StartPlanDate}
                                disabledKeyboardNavigation
                                onChangeRaw={(e) => e.preventDefault()}
                                disabled={false}
                              />
                            </div>
                          </div>
                        </div>
                      </Col>
                      <Col md="3">
                        <SearchableSelectHookForm
                          label={"Duration"}
                          name={"AuctionDuration"}
                          placeholder={"Select"}
                          Controller={Controller}
                          control={control}
                          rules={{ required: true }}
                          register={register}
                          defaultValue={""}
                          options={durationTimeDropdown()}
                          mandatory={true}
                          handleChange={() => { }}
                          errors={errors.AuctionDuration}
                        />
                      </Col>
                    </Row>
                    {/* Auction Price Section */}
                    <Row className="mt-5 pt-2">
                      <Col md="12">
                        <HeaderTitle title={"Auction Price:"} />
                      </Col>
                    </Row>

                    <Row className="part-detail-wrapper auction-price-wrapper">
                      <Col md="3">
                        <TextFieldHookForm
                          // title={titleObj.descriptionTitle}
                          label="Base Price"
                          name={"BasePrice"}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={true}
                          rules={{
                            required: true,
                            validate: { number, checkWhiteSpaces, decimalNumberLimit },
                          }}
                          handleChange={(e) => basePriceHandle(e)}
                          defaultValue={""}
                          className=""
                          customClassName={"withBorder"}
                          errors={errors.BasePrice}
                          disabled={true}
                          placeholder="Base Price"
                        />
                      </Col>
                      <Col md="2">
                        <label>Minimum Reduction Type</label>
                        <div className="d-flex">
                          <label className="switch-level mt-2">
                            <div className={'left-title mr-1'}>{'Percentage'}</div>
                            <Switch
                              onChange={() => reductionPriceToggle('basePrice')}
                              checked={state.reductionPrice}
                              id="normal-switch"
                              disabled={false}
                              background="#4DC771"
                              onColor="#4DC771"
                              onHandleColor="#ffffff"
                              offColor="#4DC771"
                              uncheckedIcon={false}
                              checkedIcon={false}
                              height={20}
                              width={46}
                            />
                            <div className={'right-title ml-1'}>{'Fixed'}</div>
                          </label>
                        </div>
                      </Col>

                      <Col md="4">
                        <div className="d-flex">
                          <TextFieldHookForm
                            label="Price %"
                            name="ReductionPercent"
                            Controller={Controller}
                            control={control}
                            register={register}
                            mandatory={true}
                            rules={{
                              required: true,
                              validate: { number, checkWhiteSpaces, maxPercentageValue, decimalNumberLimit },
                              max: {
                                value: 100,
                                message: 'Percentage value should be equal to 100'
                              },
                            }}
                            handleChange={(e) => calculateBasePriceValueAndPer(e)}
                            defaultValue=""
                            className=""
                            customClassName="withBorder remove-mh"
                            errors={
                              errors.ReductionPercent
                            }
                            placeholder={"Reduction Price %"}
                            disabled={state.reductionPrice}
                          />

                          <TextFieldHookForm
                            label="Price Value"
                            name="ReductionPrice"
                            Controller={Controller}
                            control={control}
                            register={register}
                            mandatory={true}
                            rules={{
                              required: true,
                              validate: { number, checkWhiteSpaces, maxPercentageValue, decimalNumberLimit },
                              max: {
                                value: calculationState.BasePrice,
                                message: 'Value should be equal to Base Price'
                              },
                            }}
                            handleChange={(e) => calculateBasePriceValueAndPer(e)}
                            defaultValue=""
                            className=""
                            customClassName="withBorder remove-mh"
                            errors={errors.ReductionPrice}
                            disabled={!state.reductionPrice}
                            placeholder={"Reduction Price Value"}
                          />
                        </div>
                      </Col>
                      <Col md="3">
                        <SearchableSelectHookForm
                          label={"Extension Time"}
                          name={"ExtensionTime"}
                          placeholder={"Select"}
                          Controller={Controller}
                          control={control}
                          rules={{ required: true }}
                          register={register}
                          defaultValue={""}
                          options={extenstionTime()}
                          mandatory={true}
                          handleChange={() => { }}
                          errors={errors.ExtensionTime}
                        />
                      </Col>
                    </Row>
                    {/* Price Zone Section */}
                    <HeaderTitle title={"Price Zone:"} />
                    <Row className="part-detail-wrapper prize-zone-wrapper">
                      <Col md="3">
                        <label>Price Zone Type</label>
                        <div className="d-flex">
                          <label className="switch-level mt-2">
                            <div className={'left-title mr-1'}>{'Percentage'}</div>
                            <Switch
                              onChange={() => reductionPriceToggle('priceZone')}
                              checked={state.priceZoneReduction}
                              id="normal-switch"
                              disabled={false}
                              background="#4DC771"
                              onColor="#4DC771"
                              onHandleColor="#ffffff"
                              offColor="#4DC771"
                              uncheckedIcon={false}
                              checkedIcon={false}
                              height={20}
                              width={46}
                            />
                            <div className={'right-title ml-1'}>{'Fixed'}</div>
                          </label>
                        </div>
                      </Col>
                      <Col md="3">
                        <label>Green</label>
                        <div className="d-flex">
                          <div className="d-flex">
                            <TextFieldHookForm
                              label="Price %"
                              name="GreenZoneReductionPercent"
                              Controller={Controller}
                              control={control}
                              register={register}
                              rules={{
                                required: true,
                                validate: { number, checkWhiteSpaces, maxPercentageValue, decimalNumberLimit },
                                max: {
                                  value: 100,
                                  message: 'Percentage value should be equal to 100'
                                },
                              }}
                              mandatory={false}
                              handleChange={(e) => PriceZoneCalculation('GreenZoneReductionPrice', 'GreenZoneReductionPercent', e.target.value)}
                              customClassName={`withBorder remove-mh ${state.priceZoneReduction ? '' : ''}`}
                              errors={
                                errors.GreenZoneReductionPercent
                              }
                              placeholder={"Reduction Price %"}
                              disabled={state.priceZoneReduction}
                            />
                            <TextFieldHookForm
                              label="Price Value"
                              name="GreenZoneReductionPrice"
                              Controller={Controller}
                              control={control}
                              register={register}
                              rules={{
                                required: true,
                                validate: { number, checkWhiteSpaces, decimalNumberLimit },
                                max: {
                                  value: calculationState.BasePrice,
                                  message: 'Value should be equal to Base Price'
                                },
                              }}
                              mandatory={false}
                              handleChange={(e) => PriceZoneCalculation('GreenZoneReductionPercent', 'GreenZoneReductionPrice', e.target.value)}
                              defaultValue=""
                              className=""
                              customClassName="withBorder remove-mh"
                              errors={errors.GreenZoneReductionPrice}
                              disabled={!state.priceZoneReduction}
                              placeholder={"Reduction Price Value"}
                            />
                          </div>
                        </div>
                      </Col>
                      <Col md="3">
                        <label>Yellow</label>
                        <div className="d-flex">
                          <div className="d-flex">
                            <TextFieldHookForm
                              label="Price %"
                              name="YellowZoneReductionPercent"
                              Controller={Controller}
                              control={control}
                              register={register}
                              rules={{
                                required: true,
                                validate: { number, checkWhiteSpaces, maxPercentageValue, decimalNumberLimit },
                                max: {
                                  value: calculationState.GreenZoneReductionPercent - 0.0001,
                                  message: 'Percentage value should be less than to Green value'
                                },
                              }}
                              mandatory={false}
                              handleChange={(e) => PriceZoneCalculation('YellowZoneReductionPrice', 'YellowZoneReductionPercent', e.target.value)}
                              defaultValue=""
                              className=""
                              customClassName="withBorder remove-mh"
                              errors={
                                errors.YellowZoneReductionPercent
                              }
                              placeholder={"Reduction Price %"}
                              disabled={state.priceZoneReduction}
                            />
                            <TextFieldHookForm
                              label="Price Value"
                              name="YellowZoneReductionPrice"
                              Controller={Controller}
                              control={control}
                              register={register}
                              rules={{
                                required: true,
                                validate: { number, checkWhiteSpaces, decimalNumberLimit },
                                max: {
                                  value: calculationState.BasePrice,
                                  message: 'Value should be equal or less than to Base Price'
                                },
                                min: {
                                  value: calculationState.GreenZoneReductionPrice + 0.0001,
                                  message: 'Value should be greater than to Green Zone Price'
                                },
                              }}
                              mandatory={false}
                              handleChange={(e) => PriceZoneCalculation('YellowZoneReductionPercent', 'YellowZoneReductionPrice', e.target.value)}
                              defaultValue=""
                              className=""
                              customClassName="withBorder remove-mh"
                              errors={errors.YellowZoneReductionPrice}
                              disabled={!state.priceZoneReduction}
                              placeholder={"Reduction Price Value"}
                            />
                          </div>
                        </div>
                      </Col>

                      {/* {selectedType === 'value' && ( */}
                    </Row>

                    <Row className="justify-content-between sf-btn-footer no-gutters justify-content-between bottom-footer sticky-btn-footer mt-4">
                      <div className="col-sm-12 text-right bluefooter-butn">
                        <button
                          id="addRFQ_cancel"
                          type={"button"}
                          className="reset mr-2 cancel-btn"
                          onClick={cancel}
                        >
                          <div className={"cancel-icon"}></div>
                          {"Cancel"}
                        </button>

                        {
                          <button
                            type="submit"
                            className="submit-button save-btn mr-2"
                            value="save"
                            // {!dataProps?.rowData?.IsSent && <button type="button" className="submit-button save-btn mr-2" value="save"     //RE
                            id="addRFQ_save"
                            // onClick={formToggle}
                            disabled={false}
                          >
                            <div className={"save-icon"}></div>
                            {"Publish Auction"}
                          </button>
                        }
                      </div>
                    </Row>
                  </form>

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* </Drawer > */}
        {/* {showPopup && (
            <PopupMsgWrapper
              disablePopup={alreadyInDeviation}
              vendorId={vendorId}
              plantId={plantId}
              redirectPath={blocked ? "/initiate-unblocking" : ""}
              isOpen={showPopup}
              closePopUp={closePopUp}
              confirmPopup={onPopupConfirm}
              message={
                blocked ? `${popupMessage}` : `${MESSAGES.RFQ_ADD_SUCCESS}`
              }
            />
          )} */}
      </div>
    </>
  );
}

export default AddAuction;
