import React, { Component } from "react";
import { connect } from "react-redux";
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Row, Col, Table } from "reactstrap";
import { required, checkForNull, number, positiveAndDecimalNumber, maxLength10, checkForDecimalAndNull, decimalLengthFour } from "../../../helper/validation";
import { renderText, searchableSelect } from "../../layout/FormInputs";
import { fetchSupplierCityDataAPI, getCityByCountry, getAllCity } from "../../../actions/Common";
import { getVendorWithVendorCodeSelectList } from "../actions/Supplier";
import { getVendorListByVendorType } from "../actions/Material";
import {
  createFreight, updateFright, getFreightData, getFreightModeSelectList, getFreigtFullTruckCapacitySelectList, getFreigtRateCriteriaSelectList,
} from "../actions/Freight";
import Toaster from "../../common/Toaster";
import { MESSAGES } from "../../../config/message";
import { loggedInUserId, userDetails } from "../../../helper/auth";
import Switch from "react-switch";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AddVendorDrawer from "../supplier-master/AddVendorDrawer";
import DayTime from "../../common/DayTimeWrapper"
import NoContentFound from "../../common/NoContentFound";
import { EMPTY_DATA } from "../../../config/constants";
import LoaderCustom from "../../common/LoaderCustom";
import { debounce } from "lodash";
import TooltipCustom from '../../common/Tooltip';
import AsyncSelect from 'react-select/async';

const selector = formValueSelector("AddFreight");
class AddFreight extends Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    this.state = {
      FreightID: "",
      isEditFlag: false,
      isViewMode: this.props?.data?.isViewMode ? true : false,
      IsVendor: false,
      TransPortMood: [],
      FullTruckCapacity: [],
      RateCriteria: [],
      isEditIndex: false,
      gridEditIndex: "",
      gridTable: [],
      isOpenVendor: false,
      vendorName: [],
      IsLoadingUnloadingApplicable: false,
      sourceLocation: [],
      destinationLocation: [],
      effectiveDate: "",
      DataToChange: [],
      AddUpdate: true,
      DeleteChanged: true,
      HandleChanged: true,
      setDisable: false,
      isVendorNameNotSelected: false,
      inputLoader: false
    };
  }
  /**
   * @method componentDidMount
   * @description Called after rendering the component
   */
  componentDidMount() {

    this.props.getFreightModeSelectList((res) => { });
    this.props.getFreigtFullTruckCapacitySelectList((res) => { });
    this.props.getFreigtRateCriteriaSelectList((res) => { });
    this.getDetails();
    this.props.getAllCity(cityId => {
      this.props.getCityByCountry(cityId, 0, () => { })
    })
  }
  /**
   * @method onPressVendor
   * @description Used for Vendor checked
   */
  onPressVendor = () => {
    this.setState({
      IsVendor: !this.state.IsVendor,
      vendorName: [],
    });
    this.setState({ inputLoader: true })
    this.props.getVendorListByVendorType(true, () => { this.setState({ inputLoader: false }) });
  };
  /**
   * @method handleTransportMoodChange
   * @description  used to handle BOP Category Selection
   */
  handleTransportMoodChange = (newValue, actionMeta) => {
    if (newValue && newValue !== "") {
      this.setState({ TransPortMood: newValue });
    } else {
      this.setState({ TransPortMood: [] });
    }
  };
  /**
   * @method getDetails
   * @description Used to get Details
   */
  getDetails = () => {
    const { data } = this.props;
    if (data && data.isEditFlag) {
      this.setState({
        isEditFlag: false,
        isLoader: true,
        FreightID: data.Id,
      });

      this.props.getFreightData(data.Id, (res) => {
        if (res && res.data && res.data.Result) {
          const Data = res.data.Data;
          this.setState({ DataToChange: Data })
          setTimeout(() => {
            const { cityList, vendorListByVendorType, freightModeSelectList, } = this.props;
            let modeObj =
              freightModeSelectList && freightModeSelectList.find((item) => item.Value === Data.Mode);
            let vendorObj =
              vendorListByVendorType && vendorListByVendorType.find((item) => item.Value === Data.VendorId);
            let sourceLocationObj =
              cityList && cityList.find((item) => Number(item.Value) === Data.SourceCityId);
            let destinationLocationObj = cityList && cityList.find((item) => Number(item.Value) === Data.DestinationCityId);
            let GridArray =
              Data &&
              Data.FullTruckLoadDetails.map((item) => {
                return {
                  FullTruckLoadId: item.FullTruckLoadId,
                  FreightId: item.FreightId,
                  Capacity: item.Capacity,
                  RateCriteria: item.RateCriteria,
                  EffectiveDate: DayTime(item.EffectiveDate),
                  Rate: item.Rate,
                };
              });
            this.setState({
              isEditFlag: true,
              // isLoader: false,
              IsVendor: Data.IsVendor,
              IsLoadingUnloadingApplicable: Data.IsLoadingUnloadingApplicable,
              TransPortMood:
                modeObj && modeObj !== undefined
                  ? { label: modeObj.Text, value: modeObj.Value }
                  : [],
              vendorName:
                vendorObj && vendorObj !== undefined
                  ? { label: vendorObj.Text, value: vendorObj.Value }
                  : [],
              sourceLocation:
                sourceLocationObj && sourceLocationObj !== undefined
                  ? {
                    label: sourceLocationObj.Text,
                    value: sourceLocationObj.Value,
                  }
                  : [],
              destinationLocation:
                destinationLocationObj && destinationLocationObj !== undefined
                  ? {
                    label: destinationLocationObj.Text,
                    value: destinationLocationObj.Value,
                  }
                  : [],
              gridTable: GridArray,
            }, () => this.setState({ isLoader: false }));
          }, 200);
        }
      });
    } else {
      this.setState({
        isLoader: false,
      })
      this.props.getFreightData("", (res) => { });
    }
  };
  /**
   * @method renderListing
   * @description Used to show type of listing
   */
  renderListing = (label) => {
    const { vendorListByVendorType, cityList, freightModeSelectList, freightFullTruckCapacitySelectList, freightRateCriteriaSelectList, } = this.props;
    const temp = [];
    if (label === "VendorNameList") {
      vendorListByVendorType &&
        vendorListByVendorType.map((item) => {
          if (item.Value === "0") return false;
          temp.push({ label: item.Text, value: item.Value });
        });
      return temp;
    }
    if (label === "SourceLocation") {
      cityList &&
        cityList.map((item) => {
          if (item.Value === "0") return false;
          temp.push({ label: item.Text, value: item.Value });
        });
      return temp;
    }
    if (label === "DestinationLocation") {
      cityList &&
        cityList.map((item) => {
          if (item.Value === "0") return false;
          temp.push({ label: item.Text, value: item.Value });
        });
      return temp;
    }
    if (label === "FREIGHT_MODE") {
      freightModeSelectList &&
        freightModeSelectList.map((item) => {
          if (item.Value === "0") return false;
          temp.push({ label: item.Text, value: item.Value });
        });
      return temp;
    }
    if (label === "FULL_TRUCK_CAPACITY") {
      freightFullTruckCapacitySelectList &&
        freightFullTruckCapacitySelectList.map((item) => {
          if (item.Value === "0") return false;
          temp.push({ label: item.Text, value: item.Value });
        });
      return temp;
    }
    if (label === "FREIGHT_RATE_CRITERIA") {
      freightRateCriteriaSelectList &&
        freightRateCriteriaSelectList.map((item) => {
          if (item.Value === "0") return false;
          temp.push({ label: item.Text, value: item.Value });
        });
      return temp;
    }
  };
  /**
   * @method handleVendorName
   * @description called
   */
  handleVendorName = (newValue, actionMeta) => {
    if (newValue && newValue !== "") {
      this.setState({ vendorName: newValue, isVendorNameNotSelected: false });
    } else {
      this.setState({ vendorName: [] });
    }
  };
  vendorToggler = () => {
    this.setState({ isOpenVendor: true });
  };
  closeVendorDrawer = (e = "") => {
    this.setState({ isOpenVendor: false }, () => {
      this.props.getVendorListByVendorType(true, () => { });
    });
  };
  /**
   * @method handleSourceCity
   * @description called
   */
  handleSourceCity = (newValue, actionMeta) => {
    if (newValue && newValue !== "") {
      this.setState({ sourceLocation: newValue });
    } else {
      this.setState({ sourceLocation: [] });
    }
  };
  /**
   * @method handleDestinationCity
   * @description called
   */
  handleDestinationCity = (newValue, actionMeta) => {
    if (newValue && newValue !== "") {
      this.setState({ destinationLocation: newValue });
    } else {
      this.setState({ destinationLocation: [] });
    }
  };
  /**
   * @method onPressLoadUnload
   * @description USED FOR LOAD UNLOAD CHECKED
   */
  onPressLoadUnload = () => {
    this.setState({
      IsLoadingUnloadingApplicable: !this.state.IsLoadingUnloadingApplicable,
    });
  };
  /**
   * @method handleCapacity
   * @description called
   */
  handleCapacity = (newValue, actionMeta) => {
    if (newValue && newValue !== "") {
      this.setState({ FullTruckCapacity: newValue });
    } else {
      this.setState({ FullTruckCapacity: [] });
    }
    this.setState({ HandleChanged: false })
  };
  /**
   * @method criteriaHandler
   * @description called
   */
  criteriaHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== "") {
      this.setState({ RateCriteria: newValue });
    } else {
      this.setState({ RateCriteria: [] });
    }
    this.setState({ HandleChanged: false })
  };
  /**
   * @method handleChange
   * @description Handle Effective Date
   */
  handleEffectiveDateChange = (date) => {
    this.setState({ effectiveDate: date });
    this.setState({ HandleChanged: false })
  };
  gridHandler = () => {
    const {
      FullTruckCapacity,
      RateCriteria,
      gridTable,
      effectiveDate,
    } = this.state;
    const { fieldsObj } = this.props;
    if (FullTruckCapacity.length === 0 || RateCriteria.length === 0) {
      Toaster.warning("Fields should not be empty");
      return false;
    }
    //CONDITION TO CHECK DUPLICATE ENTRY IN GRID
    const isExist = gridTable.findIndex(
      (el) =>
        el.CapacityId === FullTruckCapacity.value &&
        el.RateCriteriaId === RateCriteria.value
    );
    if (isExist !== -1) {
      Toaster.warning("Already added, Please check the values.");
      return false;
    }
    const Rate =
      fieldsObj && fieldsObj !== undefined ? checkForNull(fieldsObj) : 0;
    const tempArray = [];
    tempArray.push(...gridTable, {
      FullTruckLoadId: "",
      Capacity: FullTruckCapacity.label,
      RateCriteria: RateCriteria.label,
      EffectiveDate: effectiveDate,
      Rate: Rate,
    });
    this.setState(
      {
        gridTable: tempArray,
        FullTruckCapacity: [],
        RateCriteria: [],
        effectiveDate: '',
      },
      () => this.props.change("Rate", 0)
    );
    this.setState({ AddUpdate: false })
  };
  /**
   * @method updateGrid
   * @description Used to handle update grid
   */
  updateGrid = () => {
    const { FullTruckCapacity, RateCriteria, gridTable, effectiveDate, gridEditIndex, } = this.state;
    const { fieldsObj } = this.props;
    const Rate =
      fieldsObj && fieldsObj !== undefined ? checkForNull(fieldsObj) : 0;
    //CONDITION TO SKIP DUPLICATE ENTRY IN GRID
    let skipEditedItem = gridTable.filter((el, i) => {
      if (i === gridEditIndex) return false;
      return true;
    });
    //CONDITION TO CHECK DUPLICATE ENTRY EXCEPT EDITED RECORD
    const isExist = skipEditedItem.findIndex(
      (el) =>
        el.Capacity === FullTruckCapacity.value &&
        el.RateCriteria === RateCriteria.value
    );
    if (isExist !== -1) {
      Toaster.warning("Already added, Please check the values.");
      return false;
    }
    let tempArray = [];
    let tempData = gridTable[gridEditIndex];
    tempData = {
      Capacity: FullTruckCapacity.label,
      RateCriteria: RateCriteria.label,
      EffectiveDate: effectiveDate,
      Rate: Rate,
    };
    tempArray = Object.assign([...gridTable], { [gridEditIndex]: tempData });
    this.setState(
      {
        gridTable: tempArray,
        FullTruckCapacity: [],
        RateCriteria: [],
        gridEditIndex: "",
        isEditIndex: false,
      },
      () => this.props.change("Rate", 0)
    );
    this.setState({ AddUpdate: false })
  };
  /**
   * @method resetGridData
   * @description Used to handle resetGridData
   */
  resetGridData = () => {
    this.setState(
      {
        FullTruckCapacity: [],
        RateCriteria: [],
        gridEditIndex: "",
        isEditIndex: false,
      },
      () => this.props.change("Rate", 0)
    );
  };
  /**
   * @method editGridItemDetails
   * @description used to Edit grid data
   */
  editGridItemDetails = (index) => {
    const { gridTable } = this.state;
    const tempData = gridTable[index];
    this.setState(
      {
        gridEditIndex: index,
        isEditIndex: true,
        FullTruckCapacity: {
          label: tempData.Capacity,
          value: tempData.Capacity,
        },
        RateCriteria: {
          label: tempData.RateCriteria,
          value: tempData.RateCriteria,
        },
        effectiveDate: tempData.EffectiveDate,
      },
      () => this.props.change("Rate", tempData.Rate)
    );
  };
  /**
   * @method deleteGridItem
   * @description DELETE GRID ITEM
   */
  deleteGridItem = (index) => {
    const { gridTable } = this.state;
    let tempData = gridTable.filter((item, i) => {
      if (i === index) return false;
      return true;
    });
    this.setState({ gridTable: tempData });
    this.setState({ DeleteChanged: false });
  };
  /**
   * @method cancel
   * @description used to Reset form
   */
  cancel = () => {
    const { reset } = this.props;
    reset();
    this.setState({
      IsVendor: false,
      isOpenVendor: false,
      vendorName: [],
      sourceLocation: [],
      destinationLocation: [],
    });
    this.props.hideForm();
  };
  /**
   * @method onSubmit
   * @description Used to Submit the form
   */
  onSubmit = debounce((values) => {
    const {
      IsVendor, TransPortMood, vendorName, IsLoadingUnloadingApplicable, sourceLocation, destinationLocation,
      FreightID, gridTable, isEditFlag, DataToChange, HandleChanged, AddUpdate, DeleteChanged } = this.state;
    const { fieldsObj } = this.props;


    if (vendorName.length <= 0) {
      this.setState({ isVendorNameNotSelected: true, setDisable: false })      // IF VENDOR NAME IS NOT SELECTED THEN WE WILL SHOW THE ERROR MESSAGE MANUALLY AND SAVE BUTTON WILL NOT BE DISABLED
      return false
    }
    this.setState({ isVendorNameNotSelected: false })

    const userDetail = userDetails();
    if (isEditFlag) {

      if (
        DataToChange.LoadingUnloadingCharges == values.LoadingUnloadingCharges &&
        DataToChange.PartTruckLoadRatePerCubicFeet == values.PartTruckLoadRatePerCubicFeet &&
        DataToChange.PartTruckLoadRatePerKilogram == values.PartTruckLoadRatePerKilogram
        &&
        (AddUpdate && HandleChanged) &&
        DeleteChanged
      ) {

        this.cancel()
        return false
      }
      this.setState({ setDisable: true })
      let requestData = {
        FreightId: FreightID,
        IsLoadingUnloadingApplicable: IsLoadingUnloadingApplicable,
        LoadingUnloadingCharges: values.LoadingUnloadingCharges,
        PartTruckLoadRatePerKilogram: values.PartTruckLoadRatePerKilogram,
        PartTruckLoadRatePerCubicFeet: values.PartTruckLoadRatePerCubicFeet,
        FullTruckLoadDetails: gridTable,
        LoggedInUserId: loggedInUserId(),
      };
      this.props.reset()
      this.props.updateFright(requestData, (res) => {
        this.setState({ setDisable: false })
        if (res?.data?.Result) {
          Toaster.success(MESSAGES.UPDATE_FREIGHT_SUCCESSFULLY);
          this.cancel();
        }
      });
      this.setState({ HandleChanged: true, AddUpdate: true, DeleteChanged: true })
    } else {
      this.setState({ setDisable: true })
      const formData = {
        IsVendor: IsVendor,
        Mode: TransPortMood.label,
        VendorId: IsVendor ? vendorName.value : userDetail.ZBCSupplierInfo.VendorId,
        SourceCityId: sourceLocation.value,
        DestinationCityId: destinationLocation.value,
        IsLoadingUnloadingApplicable: IsLoadingUnloadingApplicable,
        LoadingUnloadingCharges: values.LoadingUnloadingCharges,
        PartTruckLoadRatePerKilogram: values.PartTruckLoadRatePerKilogram,
        PartTruckLoadRatePerCubicFeet: values.PartTruckLoadRatePerCubicFeet,
        FullTruckLoadDetails: gridTable,
        LoggedInUserId: loggedInUserId(),
      };

      this.props.createFreight(formData, (res) => {
        this.setState({ setDisable: false })
        if (res?.data?.Result) {
          Toaster.success(MESSAGES.ADD_FREIGHT_SUCCESSFULLY);
          this.cancel();
        }
      });
    }
  }, 500)

  handleKeyDown = function (e) {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
    }
  };

  /**
   * @method render
   * @description Renders the component
   */
  render() {
    const { handleSubmit, initialConfiguration } = this.props;
    const { isOpenVendor, isEditFlag, isViewMode, setDisable } = this.state;

    const filterList = (inputValue) => {
      let tempArr = []

      tempArr = this.renderListing("VendorNameList").filter(i =>
        i.label !== null && i.label.toLowerCase().includes(inputValue.toLowerCase())
      );

      if (tempArr.length <= 100) {
        return tempArr
      } else {
        return tempArr.slice(0, 100)
      }
    };

    const promiseOptions = inputValue =>
      new Promise(resolve => {
        resolve(filterList(inputValue));


      });

    return (
      <>
        {this.state.isLoader && <LoaderCustom />}
        <div className="container-fluid">
          <div>
            <div className="login-container signup-form">
              <div className="row">
                <div className="col-md-12">
                  <div className="shadow-lgg login-formg">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-heading mb-0">
                          <h1>
                            {isEditFlag
                              ? `Update Freight`
                              : `Add Freight`}
                          </h1>
                        </div>
                      </div>
                    </div>
                    <form
                      noValidate
                      className="form"
                      onSubmit={handleSubmit(this.onSubmit.bind(this))}
                      onKeyDown={(e) => { this.handleKeyDown(e, this.onSubmit.bind(this)); }}
                    >
                      <div className="add-min-height">
                        <Row>
                          <Col md="4" className="switch mb15">
                            <label className="switch-level">
                              <div className={"left-title"}>Zero Based</div>
                              <Switch
                                onChange={this.onPressVendor}
                                checked={this.state.IsVendor}
                                id="normal-switch"
                                disabled={isEditFlag ? true : false}
                                background="#4DC771"
                                onColor="#4DC771"
                                onHandleColor="#ffffff"
                                offColor="#4DC771"
                                uncheckedIcon={false}
                                checkedIcon={false}
                                height={20}
                                width={46}
                              />
                              <div className={"right-title"}>Vendor Based</div>
                            </label>
                          </Col>
                        </Row>
                        <Row>
                          <Col md="12">
                            <div className="left-border">{"Freight:"}</div>
                          </Col>
                          <Col md="3">
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                              <div className="fullinput-icon">
                                <Field
                                  name="Mode"
                                  type="text"
                                  label="Mode"
                                  component={searchableSelect}
                                  placeholder={"Select"}
                                  options={this.renderListing("FREIGHT_MODE")}
                                  //onKeyUp={(e) => this.changeItemDesc(e)}
                                  validate={
                                    this.state.TransPortMood == null ||
                                      this.state.TransPortMood.length === 0
                                      ? [required]
                                      : []
                                  }
                                  required={true}
                                  handleChangeDescription={
                                    this.handleTransportMoodChange
                                  }
                                  valueDescription={this.state.TransPortMood}
                                  disabled={isEditFlag ? true : false}
                                />
                              </div>
                            </div>
                          </Col>
                          {this.state.IsVendor === true && (
                            <Col md="3">
                              <label>{"Vendor Name"}<span className="asterisk-required">*</span></label>
                              <div className="d-flex justify-space-between align-items-center p-relative async-select">
                                {true && <LoaderCustom customClass={`vendor-input-loader`} />}
                                <div className="fullinput-icon">
                                  <AsyncSelect
                                    name="vendorName"
                                    ref={this.myRef}
                                    key={this.state.updateAsyncDropdown}
                                    loadOptions={promiseOptions}
                                    onChange={(e) => this.handleVendorName(e)}
                                    value={this.state.vendorName}
                                    noOptionsMessage={({ inputValue }) => !inputValue ? "Please enter vendor name/code" : "No results found"}
                                    isDisabled={(isEditFlag || this.state.inputLoader) ? true : true} />
                                  {this.state.isVendorNameNotSelected && <div className='text-help'>This field is required.</div>}
                                </div>
                                {!isEditFlag && (
                                  <div
                                    onClick={this.vendorToggler}
                                    className={"plus-icon-square  right"}
                                  ></div>
                                )}
                              </div>
                            </Col>
                          )}
                          <Col md="3">
                            <Field
                              name="SourceLocation"
                              type="text"
                              label="Source City"
                              component={searchableSelect}
                              placeholder={"Select"}
                              options={this.renderListing("SourceLocation")}
                              //onKeyUp={(e) => this.changeItemDesc(e)}
                              validate={
                                this.state.sourceLocation == null ||
                                  this.state.sourceLocation.length === 0
                                  ? [required]
                                  : []
                              }
                              required={true}
                              handleChangeDescription={this.handleSourceCity}
                              valueDescription={this.state.sourceLocation}
                              disabled={isEditFlag ? true : false}
                            />
                          </Col>
                          <Col md="3">
                            <Field
                              name="DestinationLocation"
                              type="text"
                              label="Destination City"
                              component={searchableSelect}
                              placeholder={"Select"}
                              options={this.renderListing("DestinationLocation")}
                              //onKeyUp={(e) => this.changeItemDesc(e)}
                              validate={
                                this.state.destinationLocation == null ||
                                  this.state.destinationLocation.length === 0
                                  ? [required]
                                  : []
                              }
                              required={true}
                              handleChangeDescription={this.handleDestinationCity}
                              valueDescription={this.state.destinationLocation}
                              disabled={isEditFlag ? true : false}
                            />
                          </Col>
                        </Row>
                        <Row className="mb27">
                          <Col md="12">
                            <label
                              className={`custom-checkbox w-auto`}
                              onChange={this.onPressLoadUnload}
                            >
                              Loading/Unloading Charges
                              <input
                                type="checkbox"
                                checked={this.state.IsLoadingUnloadingApplicable}
                                disabled={isViewMode}
                              />
                              <span
                                className=" before-box"
                                checked={this.state.IsLoadingUnloadingApplicable}
                                onChange={this.onPressLoadUnload}
                              />
                            </label>
                          </Col>
                          {/* {this.state.IsLoadingUnloadingApplicable && ( */}
                          <Col md="3" className="hide-label-inside">
                            <Field
                              label={``}
                              name={"LoadingUnloadingCharges"}
                              type="text"
                              placeholder={"Enter"}
                              validate={[positiveAndDecimalNumber, maxLength10, decimalLengthFour]}
                              component={renderText}
                              disabled={isViewMode}
                              className=""
                              customClassName=" withBorder mn-height-auto"
                            />
                          </Col>
                          {/* )} */}
                        </Row>
                        <Row>
                          <Col md="12">
                            <div className="left-border">
                              {"Part Truck Load:"}
                            </div>
                          </Col>
                          <Col md="3">
                            <Field
                              label={`Rate (INR/Kg)`}
                              name={"PartTruckLoadRatePerKilogram"}
                              type="text"
                              placeholder={"Enter"}
                              validate={[positiveAndDecimalNumber, maxLength10, decimalLengthFour]}
                              component={renderText}
                              disabled={isViewMode}
                              className=" "
                              customClassName=" withBorder"
                            />
                          </Col>
                          <Col md="3">
                            <Field
                              label={`Rate (INR/Cubic Feet)`}
                              name={"PartTruckLoadRatePerCubicFeet"}
                              type="text"
                              placeholder={"Enter"}
                              validate={[positiveAndDecimalNumber, maxLength10, decimalLengthFour]}
                              component={renderText}
                              disabled={isViewMode}
                              className=" "
                              customClassName=" withBorder"
                            />
                          </Col>
                        </Row>
                        <Row>
                          <Col md="12">
                            <div className="left-border">
                              {"Full Truck Load:"}
                            </div>
                          </Col>
                          <Col md="3">
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                              <div className="fullinput-icon">
                                <Field
                                  name="Capacity"
                                  type="text"
                                  label="Capacity"
                                  component={searchableSelect}
                                  placeholder={"Select"}
                                  options={this.renderListing(
                                    "FULL_TRUCK_CAPACITY"
                                  )}

                                  handleChangeDescription={this.handleCapacity}
                                  valueDescription={this.state.FullTruckCapacity}
                                  disabled={isViewMode}
                                />
                              </div>
                            </div>
                          </Col>
                          <Col md="3">
                            <Field
                              name="RateCriteria"
                              type="text"
                              label="Criteria"
                              component={searchableSelect}
                              placeholder={"Select"}
                              options={this.renderListing(
                                "FREIGHT_RATE_CRITERIA"
                              )}
                              disabled={isViewMode}
                              handleChangeDescription={this.criteriaHandler}
                              valueDescription={this.state.RateCriteria}
                            />
                          </Col>
                          <Col md="2">
                            <Field
                              label={`Rate (INR)`}
                              name={"Rate"}
                              type="text"
                              placeholder={"Enter"}
                              validate={[positiveAndDecimalNumber, maxLength10]}
                              component={renderText}
                              //required={true}
                              disabled={isViewMode}
                              className=" "
                              customClassName="withBorder"
                            />
                          </Col>
                          <Col md="2">
                            <div className="form-group">
                              <label>
                                Effective Date

                              </label>
                              <div className="inputbox date-section">
                                <DatePicker
                                  name="EffectiveDate"
                                  selected={this.state.effectiveDate}
                                  onChange={this.handleEffectiveDateChange}
                                  showMonthDropdown
                                  showYearDropdown
                                  dateFormat="dd/MM/yyyy"
                                  dropdownMode="select"
                                  placeholderText="Select date"
                                  className="withBorder"
                                  autoComplete={"off"}
                                  disabledKeyboardNavigation
                                  onChangeRaw={(e) => e.preventDefault()}
                                  disabled={isViewMode}
                                />
                              </div>
                            </div>
                          </Col>
                          <Col md="2">
                            <div>
                              {this.state.isEditIndex ? (
                                <>
                                  <button
                                    type="button"
                                    className={
                                      "btn btn-primary mt30 pull-left mr5 px-2 mb-2"
                                    }
                                    onClick={this.updateGrid}
                                  >
                                    Update
                                  </button>
                                  <button
                                    type="button"
                                    className={"reset-btn mt30 pull-left mb-2 w-auto px-1"}
                                    onClick={this.resetGridData}
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  disabled={isViewMode}
                                  className={"user-btn mt30 pull-left"}
                                  onClick={this.gridHandler}
                                >
                                  <div className={"plus"}></div>
                                  ADD
                                </button>
                              )}
                            </div>
                          </Col>
                        </Row>
                        <Row>
                          <Col md="12">
                            <Table className="table border" size="sm">
                              <thead>
                                <tr>
                                  <th>{`Capacity`}</th>
                                  <th>{`Criteria`}</th>
                                  <th>{`Rate`}</th>
                                  <th>{`Effective Date`}</th>
                                  <th>{`Action`}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {this.state.gridTable &&
                                  this.state.gridTable.map((item, index) => {
                                    return (
                                      <tr key={index}>
                                        <td>{item.Capacity}</td>
                                        <td>{item.RateCriteria}</td>
                                        <td>{checkForDecimalAndNull(item.Rate, initialConfiguration.NoOfDecimalForPrice)}</td>
                                        <td>
                                          {item.EffectiveDate ? DayTime(item.EffectiveDate).format("DD/MM/YYYY") : '-'}
                                        </td>
                                        <td>
                                          <button className="Edit mr-2" type={"button"} disabled={isViewMode} onClick={() => this.editGridItemDetails(index)} />
                                          <button className="Delete" type={"button"} disabled={isViewMode} onClick={() => this.deleteGridItem(index)} />
                                        </td>
                                      </tr>
                                    );
                                  })}
                              </tbody>
                            </Table>
                            {this.state.gridTable.length === 0 && (
                              <NoContentFound title={EMPTY_DATA} />
                            )}
                          </Col>

                        </Row>
                      </div>
                      <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                        <div className="col-sm-12 text-right bluefooter-butn">
                          <button
                            type={"button"}
                            className="mr15 cancel-btn"
                            onClick={this.cancel}
                            disabled={setDisable}
                          >
                            <div className={"cancel-icon"}></div>
                            {"Cancel"}
                          </button>
                          <button
                            type="submit"
                            disabled={isViewMode || setDisable}
                            className="user-btn mr5 save-btn"
                          >
                            <div className={"save-icon"}></div>
                            {isEditFlag ? "Update" : "Save"}
                          </button>
                        </div>
                      </Row>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {isOpenVendor && (
            <AddVendorDrawer
              isOpen={isOpenVendor}
              closeDrawer={this.closeVendorDrawer}
              isEditFlag={false}
              ID={""}
              anchor={"right"}
            />
          )}
        </div>
      </>
    );
  }
}
/**
 * @method mapStateToProps
 * @description return state to component as props
 * @param {*} state
 */
function mapStateToProps(state) {
  const fieldsObj = selector(state, "Rate");
  const { comman, material, freight, auth } = state;
  const { vendorListByVendorType } = material;
  const { initialConfiguration } = auth;
  const { cityList } = comman;
  const {
    freightData,
    freightModeSelectList,
    freightFullTruckCapacitySelectList,
    freightRateCriteriaSelectList,
  } = freight;
  let initialValues = {};
  if (freightData && freightData !== undefined) {
    initialValues = {
      PartTruckLoadRatePerKilogram: freightData.PartTruckLoadRatePerKilogram,
      PartTruckLoadRatePerCubicFeet: freightData.PartTruckLoadRatePerCubicFeet,
      LoadingUnloadingCharges: freightData.LoadingUnloadingCharges,
    };
  }
  return {
    cityList,
    vendorListByVendorType,
    freightModeSelectList,
    freightFullTruckCapacitySelectList,
    freightRateCriteriaSelectList,
    freightData,
    fieldsObj,
    initialValues,
    initialConfiguration
  };
}
/**
 * @method connect
 * @description connect with redux
 * @param {function} mapStateToProps
 * @param {function} mapDispatchToProps
 */
export default connect(mapStateToProps, {
  getVendorListByVendorType,
  getVendorWithVendorCodeSelectList,
  fetchSupplierCityDataAPI,
  createFreight,
  updateFright,
  getFreightData,
  getFreightModeSelectList,
  getFreigtFullTruckCapacitySelectList,
  getFreigtRateCriteriaSelectList,
  getCityByCountry,
  getAllCity
})(
  reduxForm({
    form: "AddFreight",
    enableReinitialize: true,
  })(AddFreight)
);
