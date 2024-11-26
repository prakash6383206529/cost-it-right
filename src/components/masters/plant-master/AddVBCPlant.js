import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, } from 'reactstrap';
import { required, number, maxLength6, maxLength80, minLength10, maxLength12, checkWhiteSpaces, acceptAllExceptSingleSpecialCharacter, maxLength15, postiveNumber, maxLength3, checkSpacesInString } from "../../../helper/validation";
import { loggedInUserId } from "../../../helper/auth";
import { renderText, renderTextInputField, searchableSelect, validateForm } from "../../layout/FormInputs";
import { createPlantAPI, getPlantUnitAPI, updatePlantAPI } from '../actions/Plant';
import { fetchCountryDataAPI, fetchStateDataAPI, fetchCityDataAPI, fetchSupplierCityDataAPI, getSupplierList, getCityByCountryAction, } from '../../../actions/Common';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import Drawer from '@material-ui/core/Drawer';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { LabelsClass } from '../../../helper/core';
import { withTranslation } from 'react-i18next';

class AddVBCPlant extends Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    this.state = {
      vendor: [],
      city: [],
      country: [],
      state: [],
      PlantId: '',
      IsActive: true,
      isViewMode: this.props?.isViewMode ? true : false,
      showPopup: false
    }
  }

  /**
  * @method componentDidMount
  * @description 
  */
  componentDidMount() {
    this.props.fetchCountryDataAPI(() => { })
    this.props.getSupplierList(this.state.vendorName, () => { })
    this.getDetails()
  }

  /**
  * @method getDetails
  * @description GET PLANT DETAIL
  */
  getDetails = () => {
    const { isEditFlag, ID } = this.props;
    if (isEditFlag) {
      this.setState({
        isLoader: true,
        PlantId: ID,
      })
      this.props.getPlantUnitAPI(ID, res => {
        if (res && res.data && res.data.Result) {

          const Data = res.data.Data;

          this.props.fetchStateDataAPI(Data.CountryId, () => { })
          this.props.fetchCityDataAPI(Data.StateId, () => { })

          setTimeout(() => {
            const { countryList, stateList, cityList, supplierSelectList } = this.props;

            const CountryObj = countryList && countryList.find(item => Number(item.Value) === Data.CountryId)
            const StateObj = stateList && stateList.find(item => Number(item.Value) === Data.StateId)
            const CityObj = cityList && cityList.find(item => Number(item.Value) === Data.CityIdRef)
            const VendorObj = supplierSelectList && supplierSelectList.find(item => item.Value === Data.VendorId)

            this.setState({
              isLoader: false,
              IsActive: Data.IsActive,
              country: CountryObj && CountryObj !== undefined ? { label: CountryObj.Text, value: CountryObj.Value } : [],
              state: StateObj && StateObj !== undefined ? { label: StateObj.Text, value: StateObj.Value } : [],
              city: CityObj && CityObj !== undefined ? { label: CityObj.Text, value: CityObj.Value } : [],
              vendor: VendorObj && VendorObj !== undefined ? { label: VendorObj.Text, value: VendorObj.Value } : [],
            })
          }, 500)
        }
      })
    } else {
      this.props.getPlantUnitAPI('', res => { })
    }
  }


  /**
  * @method selectType
  * @description Used show listing of unit of measurement
  */
  selectType = (label) => {
    const { countryList, stateList, cityList, supplierSelectList } = this.props;
    const temp = [];

    if (label === 'vendors') {
      supplierSelectList && supplierSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }

    if (label === 'country') {
      countryList && countryList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'state') {
      stateList && stateList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'city') {
      cityList && cityList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }

  }

  /**
  * @method vendorHandler
  * @description Used to handle Vendor
  */
  vendorHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ vendor: newValue });
    } else {
      this.setState({ vendor: [] })
    }
  };

  getAllCityData = () => {
    const { country } = this.state;
    if (country && country.label !== 'India') {
      this.props.getCityByCountryAction(country.value, '00000000000000000000000000000000', '', () => { })
    } else {
      this.props.fetchStateDataAPI(country.value, () => { })
    }
  }

  /**
  * @method countryHandler
  * @description Used to handle country
  */
  countryHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ country: newValue, state: [], city: [], }, () => {
        this.getAllCityData()
      });
    } else {
      this.setState({ country: [], state: [], city: [], })
      this.props.fetchStateDataAPI(0, () => { })
    }
  };

  /**
  * @method stateHandler
  * @description Used to handle state
  */
  stateHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ state: newValue, city: [], }, () => {
        const { state } = this.state;
        this.props.fetchCityDataAPI(state.value, () => { })
      });
    } else {
      this.setState({ state: [], city: [] });
      this.props.fetchCityDataAPI(0, () => { })
    }

  };

  /**
  * @method cityHandler
  * @description Used to handle City
  */
  cityHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ city: newValue });
    } else {
      this.setState({ city: [] });
    }
  };

  toggleDrawer = (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    this.props.closeDrawer('')
  };

  /**
  * @method cancel
  * @description used to Reset form
  */
  cancel = (type) => {
    const { reset } = this.props;
    reset();
    this.setState({
      country: [],
      state: [],
      city: [],
      PlantId: '',
    })
    this.props.getPlantUnitAPI('', res => { })
    this.toggleDrawer('', type)
  }
  cancelHandler = () => {
    this.setState({ showPopup: true })
  }
  onPopupConfirm = () => {
    this.cancel('cancel')
    this.setState({ showPopup: false })
  }
  closePopUp = () => {
    this.setState({ showPopup: false })
  }
  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = (values) => {
    const { city, vendor, PlantId } = this.state;
    const { isEditFlag } = this.props;

    if (isEditFlag) {
      this.setState({ isSubmitted: true });
      let updateData = {
        PlantId: PlantId,
        IsActive: this.state.IsActive,
        ModifiedBy: loggedInUserId(),
        PlantName: values.PlantName,
        PlantCode: values.PlantCode,
        IsVendor: true,
        AddressLine1: values.AddressLine1.trim(),
        AddressLine2: values.AddressLine2.trim(),
        ZipCode: values.ZipCode,
        PhoneNumber: values.PhoneNumber,
        Extension: values.Extension,
        CreatedByUserId: loggedInUserId(),
        CityId: city.value,
      }
      this.props.reset()
      this.props.updatePlantAPI(PlantId, updateData, (res) => {
        if (res.data.Result) {
          Toaster.success(MESSAGES.UPDATE_PLANT_SUCESS);
          this.cancel('submit')
        }
      });
    } else {

      let formData = {
        PlantName: values.PlantName,
        PlantCode: values.PlantCode,
        IsVendor: true,
        AddressLine1: values.AddressLine1?.trim(),
        AddressLine2: values.AddressLine2?.trim(),
        ZipCode: values.ZipCode,
        PhoneNumber: values.PhoneNumber,
        Extension: values.Extension,
        CreatedByUserId: loggedInUserId(),
        CityId: city.value,
        EVendorType: 0,
        VendorId: vendor.value,
      }

      this.props.reset()
      this.props.createPlantAPI(formData, (res) => {
        if (res.data.Result === true) {
          Toaster.success(MESSAGES.PLANT_ADDED_SUCCESS);
          this.cancel('submit')
        }
      });
    }
  }

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
    const { handleSubmit, isEditFlag, isViewMode, t } = this.props;
    const { country } = this.state;
    const VendorLabel = LabelsClass(t, 'MasterLabels').vendorLabel;

    return (
      <>
        <Drawer
          anchor={this.props.anchor}
          open={this.props.isOpen}
        // onClose={(e) => this.toggleDrawer(e)}
        >
          <Container>
            <div className={"drawer-wrapper drawer-700px"}>
              <form
                noValidate
                className="form"
                onSubmit={handleSubmit(this.onSubmit.bind(this))}
                onKeyDown={(e) => { this.handleKeyDown(e, this.onSubmit.bind(this)); }}
              >
                <Row className="drawer-heading">
                  <Col>
                    <div className={"header-wrapper left"}>
                      <h3>
                        {isEditFlag ? "Update VBC Plant" : "Add VBC Plant"}
                      </h3>
                    </div>
                    <div
                      onClick={(e) => this.toggleDrawer(e)}
                      className={"close-button right"}
                    ></div>
                  </Col>
                </Row>
                <Row className="pl-3">
                  <Col md="6">
                    <Field
                      name="VendorId"
                      type="text"
                      label={`${VendorLabel} (Code)`}
                      component={searchableSelect}
                      placeholder={"Select Vendor"}
                      options={this.selectType("vendors")}
                      //onKeyUp={(e) => this.changeItemDesc(e)}
                      validate={
                        this.state.vendor == null ||
                          this.state.vendor.length === 0
                          ? [required]
                          : []
                      }
                      required={true}
                      handleChangeDescription={this.vendorHandler}
                      valueDescription={this.state.vendor}
                      disabled={(isEditFlag || isViewMode) ? true : false}
                    />
                  </Col>
                  <Col md="6">
                    <Field
                      label={`Plant Name`}
                      name={"PlantName"}
                      type="text"
                      placeholder={isViewMode ? '-' : "Enter"}
                      validate={[required, acceptAllExceptSingleSpecialCharacter, maxLength80, checkWhiteSpaces, checkSpacesInString]}
                      component={renderText}
                      required={true}
                      className=""
                      customClassName={"withBorder"}
                      disabled={isViewMode}
                    />
                  </Col>
                </Row>
                <Row className="pl-3">
                  <Col md="6">
                    <Field
                      label={`Plant Code`}
                      name={"PlantCode"}
                      type="text"
                      placeholder={(isEditFlag || isViewMode) ? '-' : "Enter"}
                      validate={[acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength15, checkSpacesInString]}
                      component={renderText}
                      //required={true}
                      className=""
                      customClassName={"withBorder"}
                      disabled={(isEditFlag || isViewMode) ? true : false}
                    />
                  </Col>
                  <Col md="6">
                    <Row>
                      <Col className="Phone phoneNumber" md="8">
                        <Field
                          label="Phone Number"
                          name={"PhoneNumber"}
                          type="text"
                          placeholder={isViewMode ? '-' : "Enter"}
                          validate={[postiveNumber, minLength10, maxLength12, checkWhiteSpaces, number]}
                          component={renderTextInputField}
                          //    required={true}
                          maxLength={12}
                          className=""
                          customClassName={"withBorder"}
                          disabled={isViewMode}
                        />
                      </Col>
                      <Col className="Ext phoneNumber pr-0" md="4">
                        <Field
                          label="Ext."
                          name={"Extension"}
                          type="text"
                          placeholder={isViewMode ? '-' : "Enter"}
                          validate={[postiveNumber, maxLength3, checkWhiteSpaces]}
                          component={renderText}
                          // required={true}
                          maxLength={3}
                          className=""
                          customClassName={"withBorder"}
                          disabled={isViewMode}
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row className="pl-3">
                  <Col md="6">
                    <Field
                      label="Address 1"
                      name={"AddressLine1"}
                      type="text"
                      placeholder={isViewMode ? '-' : "Enter"}
                      validate={[acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength80]}
                      component={renderText}
                      //     required={true}
                      maxLength={26}
                      className=""
                      customClassName={"withBorder"}
                      disabled={isViewMode}
                    />
                  </Col>
                  <Col md="6">
                    <Field
                      label="Address 2"
                      name={"AddressLine2"}
                      type="text"
                      placeholder={isViewMode ? '-' : "Enter"}
                      validate={[acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength80]}
                      component={renderText}
                      //   required={true}
                      maxLength={26}
                      className=""
                      customClassName={"withBorder"}
                      disabled={isViewMode}
                    />
                  </Col>
                </Row>
                <Row className="pl-3">
                  <Col md="6">
                    <Field
                      name="CountryId"
                      type="text"
                      label="Country"
                      component={searchableSelect}
                      placeholder={isViewMode ? '-' : "Select"}
                      options={this.selectType("country")}
                      //onKeyUp={(e) => this.changeItemDesc(e)}
                      validate={
                        this.state.country == null ||
                          this.state.country.length === 0
                          ? [required]
                          : []
                      }
                      required={true}
                      handleChangeDescription={this.countryHandler}
                      valueDescription={this.state.country}
                      disabled={isViewMode}
                    />
                  </Col>
                  {(country.length === 0 || country.label === "India") && (
                    <Col md="6">
                      <Field
                        name="StateId"
                        type="text"
                        label="State"
                        component={searchableSelect}
                        placeholder={isViewMode ? '-' : "Select"}
                        options={this.selectType("state")}
                        //onKeyUp={(e) => this.changeItemDesc(e)}
                        validate={
                          this.state.state == null ||
                            this.state.state.length === 0
                            ? [required]
                            : []
                        }
                        required={true}
                        handleChangeDescription={this.stateHandler}
                        valueDescription={this.state.state}
                        disabled={isViewMode}
                      />
                    </Col>
                  )}
                </Row>

                <Row className="pl-3">
                  <Col md="6">
                    <Field
                      name="CityId"
                      type="text"
                      label="City"
                      component={searchableSelect}
                      placeholder={isViewMode ? '-' : "Select"}
                      options={this.selectType("city")}
                      //onKeyUp={(e) => this.changeItemDesc(e)}
                      validate={
                        this.state.city == null ||
                          this.state.city.length === 0
                          ? [required]
                          : []
                      }
                      required={true}
                      handleChangeDescription={this.cityHandler}
                      valueDescription={this.state.city}
                      disabled={isViewMode}
                    />
                  </Col>
                  <Col md="6">
                    <Field
                      label="ZipCode"
                      name={"ZipCode"}
                      type="text"
                      placeholder={isViewMode ? '-' : "Enter"}
                      validate={[required, number, maxLength6]}
                      component={renderText}
                      required={true}
                      //maxLength={6}
                      className=""
                      customClassName={"withBorder"}
                      disabled={isViewMode}
                    />
                  </Col>
                </Row>

                <Row className="sf-btn-footer no-gutters justify-content-between">
                  <div className="col-sm-12 text-right pr-3">
                    <button
                      type={"button"}
                      className="mr15 cancel-btn"
                      onClick={this.cancelHandler}
                    >
                      <div className={"cancel-icon"}></div>
                      {"Cancel"}
                    </button>
                    <button
                      type="submit"
                      className="user-btn save-btn"
                      disabled={isViewMode}
                    >
                      <div className={"save-icon"}></div>
                      {isEditFlag ? "Update" : "Save"}
                    </button>
                  </div>
                </Row>
              </form>
            </div>
          </Container>
        </Drawer>
        {
          this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.CANCEL_MASTER_ALERT}`} />
        }
      </>
    );
  }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ comman, plant }) {
  const { countryList, stateList, cityList, supplierSelectList } = comman;
  const { plantUnitDetail } = plant;
  let initialValues = {};
  if (plantUnitDetail && plantUnitDetail !== undefined) {
    initialValues = {
      PlantName: plantUnitDetail.PlantName,
      PlantCode: plantUnitDetail.PlantCode,
      PlantTitle: plantUnitDetail.PlantTitle,
      AddressLine1: plantUnitDetail.AddressLine1,
      AddressLine2: plantUnitDetail.AddressLine2,
      ZipCode: plantUnitDetail.ZipCode,
      PhoneNumber: plantUnitDetail.PhoneNumber,
      Extension: plantUnitDetail.Extension,
    }
  }
  return { countryList, stateList, cityList, initialValues, plantUnitDetail, supplierSelectList }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  createPlantAPI,
  fetchCountryDataAPI,
  fetchStateDataAPI,
  fetchCityDataAPI,
  getPlantUnitAPI,
  fetchSupplierCityDataAPI,
  updatePlantAPI,
  getSupplierList,
  getCityByCountryAction,
})(reduxForm({
  form: 'AddVBCPlant',
  validate: validateForm,
  enableReinitialize: true,
  touchOnChange: true
})(withTranslation(['MasterLabels'])(AddVBCPlant)));
