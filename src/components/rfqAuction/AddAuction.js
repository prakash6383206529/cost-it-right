import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, FormGroup, Label, Input } from "reactstrap";
import { AsyncSearchableSelectHookForm, SearchableSelectHookForm, TextFieldHookForm, DatePickerHookForm, } from "../layout/HookFormInputs";

import { MESSAGES } from "../../config/message";

import HeaderTitle from "../common/HeaderTitle";

import _ from "lodash";
import ComparsionAuction from "./ComparsionAuction";
import { partNo, partType, RFQ, technology } from "../../helper/Dummy";
import { searchCount, VBC_VENDOR_TYPE, ZBC } from "../../config/constants";
import { getPlantSelectListByType, getVendorNameByVendorSelectList } from "../../actions/Common";
import { autoCompleteDropdown } from "../common/CommonFunctions";
import { reactLocalStorage } from "reactjs-localstorage";


function AddAuction(props) {
  const dispatch = useDispatch();
  const { data: dataProps } = props;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
    control,
  } = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const [state, setState] = useState({
    isViewFlag: false,
    drawerOpen: false,
    comparsionAuction: false,
    selectedPriceZoneType: "priceZone%",
    selectedType: "%",
    comparsionData: {},
    vendorName: ''

  })
  const { plantSelectList } = useSelector(state => state.comman);
  useEffect(() => {
    dispatch(getPlantSelectListByType(ZBC, "MASTER", '', () => { }))
  }, [])

  const renderListing = (label) => {
    let temp = [];
    if (label === 'PartType') {
      temp = partType
    } else if (label === 'Technology') {
      temp = technology
    } else if (label === 'PartNumber') {
      temp = partNo
    } else if (label === 'RFQNumber') {
      temp = RFQ
    } else if (label === 'Plant') {
      console.log('plantSelectList: ', plantSelectList);
      plantSelectList && plantSelectList.map(item => {
        temp.push({ label: item.PlantNameCode, value: item.PlantId })
      })
    }
    return temp
  };

  /**
   * @method cancel
   * @description used to Reset form
   */
  const cancel = (isSaveAPICalled = false) => {
    props?.closeDrawer(isSaveAPICalled);
  };
  const closeDrawer = (e, isUpdate) => {
    // setIsPartDeailUpdate(isUpdate);
    setState(prevState => ({ ...prevState, drawerOpen: false }));
  };
  const formToggle = () => {
    setState(prevState => ({ ...prevState, comparsionAuction: true }));
    // props.hide(false);
  };
  const onSubmit = (data, e, isPartDetailsSent) => {


  };


  const MinimumReductionTypeData = [
    { value: "%", label: "Percentage" },
    { value: "value", label: "Fixed" },
    // Add more options if needed
  ];

  const handleRadioChange = (e) => {
    setState(prevState => ({ ...prevState, selectedType: e.target.value }));
  };
  //   Price Zone
  const MinimumPriceZoneTypeData = [
    { value: "priceZone%", label: "Percentage" },
    { value: "priceZonevalue", label: "Fixed" },
    // Add more options if needed
  ];

  const handleRadioPriceChange = (e) => {
    setState(prevState => ({ ...prevState, selectedType: '%', selectedPriceZoneType: e.target.value }));
  };
  useEffect(() => {
    setState(prevState => ({ ...prevState, selectedType: '%', selectedPriceZoneType: 'priceZone%' }));
  }, []);

  const filterList = async (inputValue) => {
    if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
      inputValue = inputValue.trim();
    }
    const resultInput = inputValue.slice(0, searchCount)
    if (inputValue?.length >= searchCount && state.vendorName !== resultInput) {
      let res
      res = await getVendorNameByVendorSelectList(VBC_VENDOR_TYPE, resultInput)
      setState(prevState => ({ ...prevState, vendorName: resultInput }));
      let vendorDataAPI = res?.data?.SelectList
      if (inputValue) {
        return autoCompleteDropdown(inputValue, vendorDataAPI, false, [], true)
      } else {
        return vendorDataAPI
      }
    }
    else {
      if (inputValue?.length < searchCount) return false
      else {
        let VendorData = reactLocalStorage?.getObject('Data')
        if (inputValue) {
          return autoCompleteDropdown(inputValue, VendorData, false, [], false)
        } else {
          return VendorData
        }
      }
    }
  };
  return (
    <>
      {!state.comparsionAuction && (
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
                    <form>
                      <Row className="part-detail-wrapper">
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
                            handleChange={() => { }}
                            errors={errors.RFQNumber}
                            disabled={false}
                          />
                        </Col>
                        <Col md="3">
                          <SearchableSelectHookForm
                            label={"Technology"}
                            name={"Technology"}
                            placeholder={"Select"}
                            Controller={Controller}
                            control={control}
                            rules={{ required: true }}
                            register={register}

                            options={renderListing("Technology")}
                            mandatory={true}
                            handleChange={() => { }}
                            errors={errors.technology}
                            disabled={false}
                          />
                        </Col>
                        <Col className="col-3">
                          <SearchableSelectHookForm
                            label={"Part Type"}
                            name={"PartType"}
                            placeholder={"Select"}
                            Controller={Controller}
                            control={control}
                            rules={{ required: true }}
                            register={register}
                            defaultValue={""}
                            options={renderListing("PartType")}
                            mandatory={true}
                            handleChange={() => { }}
                            errors={errors.Part}
                            disabled={false}
                          />
                        </Col>
                        <Col md="3" className="d-flex align-items-center">
                          <SearchableSelectHookForm
                            label={"Part No"}
                            name={"PartNumber"}
                            placeholder={"Select"}
                            Controller={Controller}
                            control={control}
                            rules={{ required: true }}
                            register={register}
                            defaultValue={""}
                            options={renderListing("PartNumber")}
                            mandatory={true}
                            handleChange={() => { }}
                            errors={errors.PartNumber}
                            disabled={false}
                          />
                          {/* {partType.length !== 0 &&
                            partTypeforRM !== BoughtOutPart && (
                              <Button
                                id="addRMSpecificatione"
                                className={"ml-2 mb-2"}
                                // icon={updateButtonPartNoTable ? 'edit_pencil_icon' : ''}
                                variant={
                                  updateButtonPartNoTable
                                    ? "Edit"
                                    : "plus-icon-square"
                                }
                                title={updateButtonPartNoTable ? "Edit" : "Add"}
                                onClick={DrawerToggle}
                                disabled={
                                  partName?.length === 0 || disabledPartUid
                                }
                              ></Button>
                            )} */}
                        </Col>

                        <Col md="3">
                          <AsyncSearchableSelectHookForm
                            label={"Vendor (Code)"}
                            name={"Vendor"}
                            placeholder={"Select"}
                            Controller={Controller}
                            control={control}
                            rules={{ required: true }}
                            register={register}
                            defaultValue={""}
                            options={renderListing("Vendor")}
                            mandatory={true}
                            handleChange={() => { }}
                            errors={errors.Vendor}
                            // isLoading={}
                            asyncOptions={filterList}
                            NoOptionMessage={
                              MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN
                            }
                            isMulti={true}
                          />
                        </Col>
                        <Col md="3">
                          <SearchableSelectHookForm
                            label={"Plant (Code)"}
                            name={"Plant"}
                            placeholder={"Select"}
                            Controller={Controller}
                            control={control}
                            rules={{ required: true }}
                            register={register}
                            defaultValue={""}
                            options={renderListing("Plant")}
                            mandatory={true}
                            handleChange={() => { }}
                            errors={errors.Plant}
                          />
                        </Col>
                        <Col md="3">
                          <TextFieldHookForm
                            // title={titleObj.descriptionTitle}
                            label="Auction Name"
                            name={"AuctionName"}
                            Controller={Controller}
                            control={control}
                            register={register}
                            rules={{ required: false }}
                            mandatory={false}
                            handleChange={() => { }}
                            defaultValue={""}
                            className=""
                            customClassName={"withBorder"}
                            errors={errors.AuctionName}
                          />
                        </Col>
                        <Col md="3">
                          <SearchableSelectHookForm
                            label={"RM Name"}
                            name={"rmName"}
                            placeholder={"Select"}
                            Controller={Controller}
                            control={control}
                            rules={{ required: true }}
                            register={register}
                            defaultValue={""}
                            options={renderListing("rmName")}
                            mandatory={true}
                            // handleChange={handlePlant}
                            errors={errors.rmName}
                            disabled={true}
                          />
                        </Col>
                        <Col md="3">
                          <SearchableSelectHookForm
                            label={"RM Grade"}
                            name={"rmgrade"}
                            placeholder={"Select"}
                            Controller={Controller}
                            control={control}
                            rules={{ required: true }}
                            register={register}
                            defaultValue={""}
                            options={renderListing("rmgrade")}
                            mandatory={true}
                            // handleChange={handlePlant}
                            errors={errors.rmgrade}
                            disabled={true}
                          />
                        </Col>
                        <Col md="3">
                          <SearchableSelectHookForm
                            label={"RM Specification"}
                            name={"rmspecification"}
                            placeholder={"Select"}
                            Controller={Controller}
                            control={control}
                            rules={{ required: true }}
                            register={register}
                            defaultValue={""}
                            options={renderListing("rmspecification")}
                            mandatory={true}
                            // handleChange={handlePlant}
                            errors={errors.rmspecification}
                            disabled={true}
                          />
                        </Col>
                        <Col md="3">
                          <SearchableSelectHookForm
                            label={"RM Code"}
                            name={"rmCode"}
                            placeholder={"Select"}
                            Controller={Controller}
                            control={control}
                            rules={{ required: true }}
                            register={register}
                            defaultValue={""}
                            options={renderListing("rmCode")}
                            mandatory={true}
                            // handleChange={handlePlant}
                            errors={errors.rmCode}
                            disabled={true}
                          />
                        </Col>
                        <Col md="3">
                          <SearchableSelectHookForm
                            label={"BOP No."}
                            name={"bopNumber"}
                            placeholder={"Select"}
                            Controller={Controller}
                            control={control}
                            rules={{ required: true }}
                            register={register}
                            options={renderListing("bopNumber")}
                            mandatory={true}
                            // handleChange={handlePlant}
                            errors={errors.bopNumber}
                            disabled={true}
                          />
                        </Col>
                        <Col md="3">
                          <SearchableSelectHookForm
                            label={"BOP Name"}
                            name={"bopName"}
                            placeholder={"Select"}
                            Controller={Controller}
                            control={control}
                            rules={{ required: true }}
                            register={register}

                            options={renderListing("bopName")}
                            mandatory={true}
                            // handleChange={handlePlant}
                            errors={errors.bopName}
                            disabled={true}
                          />
                        </Col>
                        <Col md="3">
                          <SearchableSelectHookForm
                            label={"Category"}
                            name={"bopCategory"}
                            placeholder={"Select"}
                            Controller={Controller}
                            control={control}
                            rules={{ required: true }}
                            register={register}
                            defaultValue={""}
                            options={renderListing("bopCategory")}
                            mandatory={true}
                            // handleChange={handlePlant}
                            errors={errors.bopCategory}
                            disabled={true}
                          />
                        </Col>
                        <Col md="3">
                          <div className="inputbox date-section">
                            <DatePickerHookForm
                              name={`fromDate`}
                              label={"Select Date"}
                              // handleChange={(date) => {
                              //     handleFromEffectiveDateChange(date);
                              // }}
                              rules={{ required: true }}
                              Controller={Controller}
                              control={control}
                              register={register}
                              showMonthDropdown
                              showYearDropdown
                              dateFormat="DD/MM/YYYY"
                              // maxDate={maxDate}
                              placeholder="Select date"
                              customClassName="withBorder"
                              className="withBorder"
                              autoComplete={"off"}
                              disabledKeyboardNavigation
                              onChangeRaw={(e) => e.preventDefault()}
                              disabled={false}
                              mandatory={true}
                              errors={errors && errors.fromDate}
                            />
                          </div>
                        </Col>
                        <Col md="3">
                          <div className="inputbox date-section">
                            <div className="form-group">
                              <label>Time</label>
                              <div className="inputbox date-section">
                                <TextFieldHookForm
                                  label=""
                                  name={"Time"}
                                  selected={"00:00"}
                                  Controller={Controller}
                                  control={control}
                                  register={register}
                                  rules={{
                                    required: false,
                                    pattern: {
                                      value: /^([0-9]*):([0-5]?[0-9])$/i,
                                      message:
                                        "Hours should be in hh:mm format.",
                                    },
                                  }}
                                  mandatory={false}
                                  handleChange={() => { }}
                                  defaultValue={""}
                                  className=""
                                  customClassName={
                                    "withBorder mn-height-auto hide-label mb-0"
                                  }
                                  errors={errors.Time}
                                />
                              </div>
                            </div>
                          </div>
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
                            rules={{ required: false }}
                            mandatory={false}
                            handleChange={() => { }}
                            defaultValue={""}
                            className=""
                            customClassName={"withBorder"}
                            errors={errors.BasePrice}
                            placeholder="Base Price"
                          />
                        </Col>
                        <Col md="3">
                          <FormGroup tag="fieldset">
                            <label>Minimum Reduction Type</label>
                            <div className="d-flex">
                              {MinimumReductionTypeData.map((option) => (
                                <FormGroup
                                  check
                                  key={option.value}
                                  className="mr-4"
                                >
                                  <Label check>
                                    <Input
                                      type="radio"
                                      name="MinimumReductionType"
                                      value={option.value}
                                      {...register("MinimumReductionType", {
                                        required: true,
                                      })}
                                      checked={state.selectedType === option.value}
                                      onChange={handleRadioChange}
                                    />{" "}
                                    {option.label}
                                  </Label>
                                </FormGroup>
                              ))}
                            </div>
                            {errors.MinimumReductionType && (
                              <p>This field is required</p>
                            )}
                          </FormGroup>
                        </Col>

                        <Col md="3">
                          <label>Reduction Price</label>
                          <div className="d-flex">
                            {state.selectedType === "%" ? (
                              <>
                                <TextFieldHookForm
                                  // label="Minimum Reduction Price %"
                                  name="MinimumReductionPricePercentage"
                                  Controller={Controller}
                                  control={control}
                                  register={register}
                                  rules={{ required: false }}
                                  mandatory={false}
                                  handleChange={() => { }}
                                  defaultValue=""
                                  className=""
                                  customClassName="withBorder remove-mh"
                                  errors={
                                    errors.MinimumReductionPricePercentage
                                  }
                                  placeholder={"Reduction Price %"}
                                  disabled={state.selectedType === "value"}
                                />

                                <TextFieldHookForm
                                  // label="Minimum Reduction Price Value"
                                  name="MinimumReductionPriceValue"
                                  Controller={Controller}
                                  control={control}
                                  register={register}
                                  rules={{ required: false }}
                                  mandatory={false}
                                  handleChange={() => { }}
                                  defaultValue=""
                                  className=""
                                  customClassName="withBorder remove-mh"
                                  errors={errors.MinimumReductionPriceValue}
                                  disabled={state.selectedType === "%"}
                                  placeholder={"Reduction Price Value"}
                                />
                              </>
                            ) : state.selectedType === "value" ? (
                              <>
                                <TextFieldHookForm
                                  // label="Minimum Reduction Price %"
                                  name="MinimumReductionPricePercentage"
                                  Controller={Controller}
                                  control={control}
                                  register={register}
                                  rules={{ required: false }}
                                  mandatory={false}
                                  handleChange={() => { }}
                                  defaultValue=""
                                  className=""
                                  customClassName="withBorder remove-mh"
                                  errors={
                                    errors.MinimumReductionPricePercentage
                                  }
                                  placeholder={"Reduction Price %"}
                                  disabled={state.selectedType === "value"}
                                />
                                <TextFieldHookForm
                                  // label="Minimum Reduction Price Value"
                                  name="MinimumReductionPriceValue"
                                  Controller={Controller}
                                  control={control}
                                  register={register}
                                  rules={{ required: false }}
                                  mandatory={false}
                                  handleChange={() => { }}
                                  defaultValue=""
                                  className=""
                                  customClassName="withBorder remove-mh"
                                  errors={errors.MinimumReductionPriceValue}
                                  disabled={state.selectedType === "%"}
                                  placeholder={"Reduction Price Value"}
                                />
                              </>
                            ) : (
                              <TextFieldHookForm
                                // label="Minimum Reduction Price Value"
                                name="MinimumReductionPriceValue"
                                Controller={Controller}
                                control={control}
                                register={register}
                                rules={{ required: false }}
                                mandatory={false}
                                handleChange={() => { }}
                                defaultValue=""
                                className=""
                                customClassName="withBorder remove-mh"
                                errors={errors.MinimumReductionPriceValue}
                                placeholder={"Reduction Price Value"}
                              />
                            )}
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
                            options={renderListing("ExtensionTime")}
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
                          <FormGroup tag="fieldset">
                            <label>Minimum Price Reduction Type</label>
                            <div className="d-flex">
                              {MinimumPriceZoneTypeData.map((option) => (
                                <FormGroup
                                  check
                                  key={option.value}
                                  className="mr-4"
                                >
                                  <Label check>
                                    <Input
                                      type="radio"
                                      name="MinimumReductionTypePrice"
                                      value={option.value}
                                      {...register(
                                        "MinimumReductionTypePrice",
                                        {
                                          required: true,
                                        }
                                      )}
                                      onChange={handleRadioPriceChange}
                                      checked={
                                        state.selectedPriceZoneType === option.value
                                      }
                                    />{" "}
                                    {option.label}
                                  </Label>
                                </FormGroup>
                              ))}
                            </div>
                            {errors.MinimumReductionType && (
                              <p>This field is required</p>
                            )}
                          </FormGroup>
                        </Col>

                        <Col md="3">
                          <label>Red</label>
                          <div className="d-flex">
                            {state.selectedPriceZoneType === "priceZone%" ? (
                              <>
                                <TextFieldHookForm
                                  // label="Minimum Reduction Price %"
                                  name="MinimumReductionPricePercentage"
                                  Controller={Controller}
                                  control={control}
                                  register={register}
                                  rules={{ required: false }}
                                  mandatory={false}
                                  handleChange={() => { }}
                                  defaultValue=""
                                  className=""
                                  customClassName="withBorder remove-mh"
                                  errors={
                                    errors.MinimumReductionPricePercentage
                                  }
                                  placeholder={"Reduction Price %"}
                                  disabled={
                                    state.selectedPriceZoneType === "priceZonevalue"
                                  }
                                />

                                <TextFieldHookForm
                                  // label="Minimum Reduction Price Value"
                                  name="MinimumReductionPriceValue"
                                  Controller={Controller}
                                  control={control}
                                  register={register}
                                  rules={{ required: false }}
                                  mandatory={false}
                                  handleChange={() => { }}
                                  defaultValue=""
                                  className=""
                                  customClassName="withBorder remove-mh"
                                  errors={errors.MinimumReductionPriceValue}
                                  disabled={
                                    state.selectedPriceZoneType === "priceZone%"
                                  }
                                  placeholder={"Reduction Price Value"}
                                />
                              </>
                            ) : state.selectedPriceZoneType === "priceZonevalue" ? (
                              <>
                                <TextFieldHookForm
                                  // label="Minimum Reduction Price %"
                                  name="MinimumReductionPricePercentage"
                                  Controller={Controller}
                                  control={control}
                                  register={register}
                                  rules={{ required: false }}
                                  mandatory={false}
                                  handleChange={() => { }}
                                  defaultValue=""
                                  className=""
                                  customClassName="withBorder remove-mh"
                                  errors={
                                    errors.MinimumReductionPricePercentage
                                  }
                                  placeholder={"Reduction Price %"}
                                  disabled={
                                    state.selectedPriceZoneType === "priceZonevalue"
                                  }
                                />
                                <TextFieldHookForm
                                  // label="Minimum Reduction Price Value"
                                  name="MinimumReductionPriceValue"
                                  Controller={Controller}
                                  control={control}
                                  register={register}
                                  rules={{ required: false }}
                                  mandatory={false}
                                  handleChange={() => { }}
                                  defaultValue=""
                                  className=""
                                  customClassName="withBorder remove-mh"
                                  errors={errors.MinimumReductionPriceValue}
                                  disabled={
                                    state.selectedPriceZoneType === "priceZone%"
                                  }
                                  placeholder={"Reduction Price Value"}
                                />
                              </>
                            ) : (
                              <TextFieldHookForm
                                // label="Minimum Reduction Price Value"
                                name="MinimumReductionPriceValue"
                                Controller={Controller}
                                control={control}
                                register={register}
                                rules={{ required: false }}
                                mandatory={false}
                                handleChange={() => { }}
                                defaultValue=""
                                className=""
                                customClassName="withBorder remove-mh"
                                errors={errors.MinimumReductionPriceValue}
                                placeholder={"Reduction Price Value"}
                              />
                            )}
                          </div>
                        </Col>

                        <Col md="3">
                          <label>Yellow</label>
                          <div className="d-flex">
                            {state.selectedPriceZoneType === "priceZone%" ? (
                              <>
                                <TextFieldHookForm
                                  // label="Minimum Reduction Price %"
                                  name="MinimumReductionPricePercentage"
                                  Controller={Controller}
                                  control={control}
                                  register={register}
                                  rules={{ required: false }}
                                  mandatory={false}
                                  handleChange={() => { }}
                                  defaultValue=""
                                  className=""
                                  customClassName="withBorder remove-mh"
                                  errors={
                                    errors.MinimumReductionPricePercentage
                                  }
                                  placeholder={"Reduction Price %"}
                                  disabled={
                                    state.selectedPriceZoneType === "priceZonevalue"
                                  }
                                />

                                <TextFieldHookForm
                                  // label="Minimum Reduction Price Value"
                                  name="MinimumReductionPriceValue"
                                  Controller={Controller}
                                  control={control}
                                  register={register}
                                  rules={{ required: false }}
                                  mandatory={false}
                                  handleChange={() => { }}
                                  defaultValue=""
                                  className=""
                                  customClassName="withBorder remove-mh"
                                  errors={errors.MinimumReductionPriceValue}
                                  disabled={
                                    state.selectedPriceZoneType === "priceZone%"
                                  }
                                  placeholder={"Reduction Price Value"}
                                />
                              </>
                            ) : state.selectedPriceZoneType === "priceZonevalue" ? (
                              <>
                                <TextFieldHookForm
                                  // label="Minimum Reduction Price %"
                                  name="MinimumReductionPricePercentage"
                                  Controller={Controller}
                                  control={control}
                                  register={register}
                                  rules={{ required: false }}
                                  mandatory={false}
                                  handleChange={() => { }}
                                  defaultValue=""
                                  className=""
                                  customClassName="withBorder remove-mh"
                                  errors={
                                    errors.MinimumReductionPricePercentage
                                  }
                                  placeholder={"Reduction Price %"}
                                  disabled={
                                    state.selectedPriceZoneType === "priceZonevalue"
                                  }
                                />
                                <TextFieldHookForm
                                  // label="Minimum Reduction Price Value"
                                  name="MinimumReductionPriceValue"
                                  Controller={Controller}
                                  control={control}
                                  register={register}
                                  rules={{ required: false }}
                                  mandatory={false}
                                  handleChange={() => { }}
                                  defaultValue=""
                                  className=""
                                  customClassName="withBorder remove-mh"
                                  errors={errors.MinimumReductionPriceValue}
                                  disabled={
                                    state.selectedPriceZoneType === "priceZone%"
                                  }
                                  placeholder={"Reduction Price Value"}
                                />
                              </>
                            ) : (
                              <TextFieldHookForm
                                // label="Minimum Reduction Price Value"
                                name="MinimumReductionPriceValue"
                                Controller={Controller}
                                control={control}
                                register={register}
                                rules={{ required: false }}
                                mandatory={false}
                                handleChange={() => { }}
                                defaultValue=""
                                className=""
                                customClassName="withBorder remove-mh"
                                errors={errors.MinimumReductionPriceValue}
                                placeholder={"Reduction Price Value"}
                              />
                            )}
                          </div>
                        </Col>
                        <Col md="3">
                          <label>Green</label>
                          <div className="d-flex">
                            {state.selectedPriceZoneType === "priceZone%" ? (
                              <>
                                <TextFieldHookForm
                                  // label="Minimum Reduction Price %"
                                  name="MinimumReductionPricePercentage"
                                  Controller={Controller}
                                  control={control}
                                  register={register}
                                  rules={{ required: false }}
                                  mandatory={false}
                                  handleChange={() => { }}
                                  defaultValue=""
                                  className=""
                                  customClassName="withBorder remove-mh"
                                  errors={
                                    errors.MinimumReductionPricePercentage
                                  }
                                  placeholder={"Reduction Price %"}
                                  disabled={
                                    state.selectedPriceZoneType === "priceZonevalue"
                                  }
                                />

                                <TextFieldHookForm
                                  // label="Minimum Reduction Price Value"
                                  name="MinimumReductionPriceValue"
                                  Controller={Controller}
                                  control={control}
                                  register={register}
                                  rules={{ required: false }}
                                  mandatory={false}
                                  handleChange={() => { }}
                                  defaultValue=""
                                  className=""
                                  customClassName="withBorder remove-mh"
                                  errors={errors.MinimumReductionPriceValue}
                                  disabled={
                                    state.selectedPriceZoneType === "priceZone%"
                                  }
                                  placeholder={"Reduction Price Value"}
                                />
                              </>
                            ) : state.selectedPriceZoneType === "value" ? (
                              <>
                                <TextFieldHookForm
                                  // label="Minimum Reduction Price %"
                                  name="MinimumReductionPricePercentage"
                                  Controller={Controller}
                                  control={control}
                                  register={register}
                                  rules={{ required: false }}
                                  mandatory={false}
                                  handleChange={() => { }}
                                  defaultValue=""
                                  className=""
                                  customClassName="withBorder remove-mh"
                                  errors={
                                    errors.MinimumReductionPricePercentage
                                  }
                                  placeholder={"Reduction Price %"}
                                  disabled={
                                    state.selectedPriceZoneType === "priceZonevalue"
                                  }
                                />
                                <TextFieldHookForm
                                  // label="Minimum Reduction Price Value"
                                  name="MinimumReductionPriceValue"
                                  Controller={Controller}
                                  control={control}
                                  register={register}
                                  rules={{ required: false }}
                                  mandatory={false}
                                  handleChange={() => { }}
                                  defaultValue=""
                                  className=""
                                  customClassName="withBorder remove-mh"
                                  errors={errors.MinimumReductionPriceValue}
                                  disabled={
                                    state.selectedPriceZoneType === "priceZone%"
                                  }
                                  placeholder={"Reduction Price Value"}
                                />
                              </>
                            ) : (
                              <TextFieldHookForm
                                // label="Minimum Reduction Price Value"
                                name="MinimumReductionPriceValue"
                                Controller={Controller}
                                control={control}
                                register={register}
                                rules={{ required: false }}
                                mandatory={false}
                                handleChange={() => { }}
                                defaultValue=""
                                className=""
                                customClassName="withBorder remove-mh"
                                errors={errors.MinimumReductionPriceValue}
                                placeholder={"Reduction Price Value"}
                              />
                            )}
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
                              type="button"
                              className="submit-button save-btn mr-2"
                              value="save"
                              // {!dataProps?.rowData?.IsSent && <button type="button" className="submit-button save-btn mr-2" value="save"     //RE
                              id="addRFQ_save"
                              onClick={formToggle}
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
      )}
      {state.comparsionAuction && (
        <ComparsionAuction
          data={state.comparsionData}
          //hideForm={hideForm}
          closeDrawer={closeDrawer}
        />
      )}
    </>
  );
}

export default AddAuction;
